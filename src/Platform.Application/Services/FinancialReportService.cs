using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Platform.Application.DTOs.Accounting;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public class FinancialReportOptions
    {
        public const string SectionName = "FinancialReporting";
        public double ProjectedCollectionRate { get; set; } = 0.70;
    }

    public class FinancialReportService : IFinancialReportService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly FinancialReportOptions _options;

        public FinancialReportService(ApplicationDbContext dbContext, IOptions<FinancialReportOptions> options)
        {
            _dbContext = dbContext;
            _options = options.Value;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var payments = await _dbContext.Payments.ToListAsync();
            var outstandingInvoices = await _dbContext.Invoices
                .Where(i => i.Status != InvoiceStatus.Paid && i.Status != InvoiceStatus.Cancelled)
                .ToListAsync();
            var trustTransactions = await _dbContext.TrustTransactions.ToListAsync();
            var monthlyPayments = payments.Where(p => p.PaymentDate >= DateTime.UtcNow.AddMonths(-1)).ToList();

            return new DashboardStatsDto
            {
                TotalRevenue = payments.Sum(p => p.Amount * p.ExchangeRate),
                TotalOutstanding = outstandingInvoices.Sum(i => (i.TotalAmount - i.PaidAmount) * i.ExchangeRate),
                TrustBalance = trustTransactions.Sum(t => (t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount) * t.ExchangeRate),
                MonthlyRevenue = monthlyPayments.Sum(p => p.Amount * p.ExchangeRate)
            };
        }

        public async Task<List<RevenueByMonthDto>> GetRevenueByMonthAsync()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            var payments = await _dbContext.Payments
                .Where(p => p.PaymentDate >= sixMonthsAgo)
                .ToListAsync();

            return payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .Select(g => new RevenueByMonthDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Amount = g.Sum(p => p.Amount * p.ExchangeRate)
                })
                .OrderBy(x => x.Month)
                .ToList();
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var totalCases = await _dbContext.LegalCases.CountAsync();
            var activeCases = await _dbContext.LegalCases.CountAsync(c => c.Status == CaseStatus.Active);

            var monthPayments = await _dbContext.Payments
                .Where(p => p.PaymentDate >= startOfMonth)
                .ToListAsync();
            var monthlyRevenue = monthPayments.Sum(p => p.Amount * p.ExchangeRate);

            var lastMonthPayments = await _dbContext.Payments
                .Where(p => p.PaymentDate >= startOfMonth.AddMonths(-1) && p.PaymentDate < startOfMonth)
                .ToListAsync();
            var lastMonthRevenue = lastMonthPayments.Sum(p => p.Amount * p.ExchangeRate);

            var revenueTrend = lastMonthRevenue > 0
                ? $"+{Math.Round((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100)}% عن الشهر الماضي"
                : "لا توجد بيانات كافية";

            var lastMonthCases = await _dbContext.LegalCases
                .CountAsync(c => c.CreatedOn >= startOfMonth.AddMonths(-1) && c.CreatedOn < startOfMonth);
            var thisMonthCases = await _dbContext.LegalCases
                .CountAsync(c => c.CreatedOn >= startOfMonth);
            var casesTrend = thisMonthCases >= lastMonthCases
                ? $"+{thisMonthCases - lastMonthCases} قضايا جديدة"
                : $"{thisMonthCases - lastMonthCases} قضايا";

            return new DashboardSummaryDto
            {
                TotalCases = totalCases,
                ActiveCases = activeCases,
                MonthlyRevenue = monthlyRevenue,
                RevenueTrend = revenueTrend,
                CasesTrend = casesTrend
            };
        }

        public async Task<FinancialProjectionDto> GetFinancialProjectionsAsync()
        {
            var baseCurrency = await _dbContext.Currencies.FirstOrDefaultAsync(c => c.IsBase);

            var outstandingAmount = await _dbContext.Invoices
                .SumAsync(i => (i.TotalAmount - i.PaidAmount) * i.ExchangeRate);

            var trustFunds = await _dbContext.TrustTransactions
                .SumAsync(t => (t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount) * t.ExchangeRate);

            var projectedCollections = outstandingAmount * (decimal)_options.ProjectedCollectionRate;

            return new FinancialProjectionDto
            {
                CurrentReceivables = outstandingAmount,
                TotalTrustFunds = trustFunds,
                ProjectedCollections30Days = projectedCollections,
                TotalLiquidity = projectedCollections + trustFunds
            };
        }
    }
}
