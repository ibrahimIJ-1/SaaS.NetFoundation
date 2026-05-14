using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.DTOs.Accounting;
using Platform.Application.Services;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IFinancialReportService _reportService;
        private readonly IJournalService _journalService;

        public ReportsController(
            ApplicationDbContext dbContext,
            IFinancialReportService reportService,
            IJournalService journalService)
        {
            _dbContext = dbContext;
            _reportService = reportService;
            _journalService = journalService;
        }

        [HttpGet("revenue-by-month")]
        public async Task<ActionResult<List<RevenueByMonthDto>>> GetRevenueByMonth()
        {
            return Ok(await _reportService.GetRevenueByMonthAsync());
        }

        [HttpGet("case-stats")]
        public async Task<IActionResult> GetCaseStats()
        {
            var cases = await _dbContext.LegalCases.ToListAsync();

            var stats = new
            {
                Total = cases.Count,
                Active = cases.Count(c => c.Status == CaseStatus.Active),
                Closed = cases.Count(c => c.Status == CaseStatus.Archived || c.Status == CaseStatus.Won || c.Status == CaseStatus.Lost),
                ByPriority = cases.GroupBy(c => c.Priority).Select(g => new { Priority = g.Key.ToString(), Count = g.Count() }),
                ByType = cases.GroupBy(c => c.CaseType).Select(g => new { Type = g.Key, Count = g.Count() })
            };

            return Ok(stats);
        }

        [HttpGet("lawyer-workload")]
        public async Task<IActionResult> GetLawyerWorkload()
        {
            var workload = await _dbContext.LegalCases
                .Where(c => c.Status == CaseStatus.Active)
                .GroupBy(c => c.AssignedLawyerName)
                .Select(g => new
                {
                    LawyerName = g.Key,
                    ActiveCases = g.Count(),
                    PendingTasks = _dbContext.LegalTasks.Count(t => t.LegalCase!.AssignedLawyerName == g.Key && !t.IsCompleted)
                })
                .ToListAsync();

            return Ok(workload);
        }

        [HttpGet("projections")]
        public async Task<ActionResult<FinancialProjectionDto>> GetFinancialProjections()
        {
            return Ok(await _reportService.GetFinancialProjectionsAsync());
        }

        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var summary = await _reportService.GetDashboardSummaryAsync();

            var upcomingSessions = await _dbContext.CourtSessions
                .Include(s => s.LegalCase)
                .Where(s => s.SessionDate >= DateTime.UtcNow && s.Status == SessionStatus.Scheduled)
                .OrderBy(s => s.SessionDate)
                .Take(5)
                .Select(s => new
                {
                    s.Id,
                    s.SessionDate,
                    s.CourtName,
                    s.LegalCaseId,
                    CaseTitle = s.LegalCase != null ? s.LegalCase.Title : "قضية غير معروفة",
                    ClientName = s.LegalCase != null ? s.LegalCase.ClientName : "موكل غير معروف",
                    s.Status
                })
                .ToListAsync();

            var recentDocs = await _dbContext.CaseDocuments
                .OrderByDescending(d => d.CreatedOn)
                .Take(5)
                .Select(d => new { Type = "Document", Title = "إضافة مستند جديد", Description = $"تمت إضافة {d.FileName}", Date = d.CreatedOn })
                .ToListAsync();

            var recentPayments = await _dbContext.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i.LegalCase)
                .OrderByDescending(p => p.PaymentDate)
                .Take(5)
                .Select(p => new
                {
                    Type = "Payment",
                    Title = "دفعة مستلمة",
                    Description = $"تم استلام {p.Amount} لـ {(p.Invoice.LegalCase != null ? p.Invoice.LegalCase.ClientName : "موكل")}",
                    Date = p.PaymentDate
                })
                .ToListAsync();

            var recentTasks = await _dbContext.LegalTasks
                .Where(t => t.IsCompleted)
                .OrderByDescending(t => t.LastModifiedOn)
                .Take(5)
                .Select(t => new
                {
                    Type = "Task",
                    Title = "إكمال مهمة",
                    Description = $"تم إنجاز: {t.Title}",
                    Date = t.LastModifiedOn ?? t.CreatedOn
                })
                .ToListAsync();

            var activities = recentDocs
                .Concat(recentPayments)
                .Concat(recentTasks)
                .OrderByDescending(a => a.Date)
                .Take(10)
                .ToList();

            return Ok(new
            {
                TotalCases = summary.TotalCases,
                ActiveCases = summary.ActiveCases,
                MonthlyRevenue = summary.MonthlyRevenue,
                RevenueTrend = summary.RevenueTrend,
                CasesTrend = summary.CasesTrend,
                UpcomingSessions = upcomingSessions,
                RecentActivities = activities
            });
        }

        // ── Double-Entry Accounting Reports ──────────────────────────────

        [HttpGet("trial-balance")]
        public async Task<ActionResult<List<TrialBalanceDto>>> GetTrialBalance([FromQuery] DateTime? asOf)
        {
            return Ok(await _journalService.GetTrialBalanceAsync(asOf));
        }

        [HttpGet("balance-sheet")]
        public async Task<ActionResult<BalanceSheetDto>> GetBalanceSheet([FromQuery] DateTime? asOf)
        {
            return Ok(await _journalService.GetBalanceSheetAsync(asOf));
        }

        [HttpGet("income-statement")]
        public async Task<ActionResult<IncomeStatementDto>> GetIncomeStatement(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = to ?? DateTime.UtcNow;
            return Ok(await _journalService.GetIncomeStatementAsync(fromDate, toDate));
        }

        [HttpGet("ar-aging")]
        public async Task<ActionResult<List<AccountsReceivableAgingDto>>> GetAccountsReceivableAging([FromQuery] DateTime? asOf)
        {
            return Ok(await _journalService.GetAccountsReceivableAgingAsync(asOf));
        }

        [HttpGet("general-ledger/{accountId}")]
        public async Task<ActionResult<List<GeneralLedgerEntryDto>>> GetGeneralLedger(
            Guid accountId,
            [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            return Ok(await _journalService.GetGeneralLedgerAsync(accountId, from, to));
        }

        [HttpGet("journal-entries")]
        public async Task<ActionResult<List<JournalEntryDto>>> GetJournalEntries(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to,
            [FromQuery] string? referenceType, [FromQuery] Guid? referenceId)
        {
            return Ok(await _journalService.GetEntriesAsync(from, to, referenceType, referenceId));
        }
    }
}
