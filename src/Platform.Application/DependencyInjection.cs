using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Platform.Application.Services;

namespace Platform.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration? configuration = null)
        {
            services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));

            // Accounting Services
            services.AddScoped<IInvoiceService, InvoiceService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IExpenseService, ExpenseService>();
            services.AddScoped<ITrustService, TrustService>();
            services.AddScoped<ICommissionService, CommissionService>();
            services.AddScoped<IFinancialReportService, FinancialReportService>();

            // Double-Entry Accounting
            services.AddScoped<IJournalService, JournalService>();
            services.AddScoped<IPostingService, PostingService>();

            // Options
            if (configuration != null)
                services.Configure<FinancialReportOptions>(configuration.GetSection(FinancialReportOptions.SectionName));

            return services;
        }
    }
}
