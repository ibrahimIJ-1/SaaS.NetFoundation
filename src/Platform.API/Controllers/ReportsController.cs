using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

        public ReportsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("revenue-by-month")]
        public async Task<IActionResult> GetRevenueByMonth()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            
            var payments = await _dbContext.Payments
                .Where(p => p.PaymentDate >= sixMonthsAgo)
                .ToListAsync();

            var monthlyData = payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Amount = g.Sum(p => p.Amount)
                })
                .OrderBy(x => x.Month)
                .ToList();

            return Ok(monthlyData);
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
        public async Task<IActionResult> GetFinancialProjections()
        {
            var outstandingAmount = await _dbContext.Invoices
                .SumAsync(i => i.TotalAmount - i.PaidAmount);

            var trustFunds = await _dbContext.TrustTransactions
                .SumAsync(t => t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount);

            // Simple projection: 70% of outstanding is collectable in 30 days
            var projectedCollections = outstandingAmount * 0.70m;

            return Ok(new
            {
                CurrentReceivables = outstandingAmount,
                TotalTrustFunds = trustFunds,
                ProjectedCollections30Days = projectedCollections,
                TotalLiquidity = projectedCollections + trustFunds
            });
        }
        [HttpGet("dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var totalCases = await _dbContext.LegalCases.CountAsync();
            var activeCases = await _dbContext.LegalCases.CountAsync(c => c.Status == CaseStatus.Active);
            
            var monthlyRevenue = await _dbContext.Payments
                .Where(p => p.PaymentDate >= startOfMonth)
                .SumAsync(p => p.Amount);

            var upcomingSessions = await _dbContext.CourtSessions
                .Include(s => s.LegalCase)
                .Where(s => s.SessionDate >= DateTime.UtcNow && s.Status == SessionStatus.Scheduled)
                .OrderBy(s => s.SessionDate)
                .Take(5)
                .Select(s => new {
                    s.Id,
                    s.SessionDate,
                    s.CourtName,
                    s.LegalCaseId,
                    CaseTitle = s.LegalCase != null ? s.LegalCase.Title : "قضية غير معروفة",
                    ClientName = s.LegalCase != null ? s.LegalCase.ClientName : "موكل غير معروف",
                    s.Status
                })
                .ToListAsync();

            // Aggregating Recent Activities
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
                .Select(p => new { 
                    Type = "Payment", 
                    Title = "دفعة مستلمة", 
                    Description = $"تم استلام {p.Amount:C} لـ {(p.Invoice.LegalCase != null ? p.Invoice.LegalCase.ClientName : "موكل")}", 
                    Date = p.PaymentDate 
                })
                .ToListAsync();

            var recentTasks = await _dbContext.LegalTasks
                .Where(t => t.IsCompleted)
                .OrderByDescending(t => t.LastModifiedOn)
                .Take(5)
                .Select(t => new { 
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
                TotalCases = totalCases,
                ActiveCases = activeCases,
                MonthlyRevenue = monthlyRevenue,
                RevenueTrend = "+15% عن الشهر الماضي", // Mock trend for now
                CasesTrend = "+5 قضايا جديدة",
                UpcomingSessions = upcomingSessions,
                RecentActivities = activities
            });
        }
    }
}

