using Hangfire.Server;
using Microsoft.Extensions.DependencyInjection;
using Platform.Application.Abstractions;
using Platform.Application.Realtime.Interfaces;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Infrastructure.Jobs.Handlers
{
    public class OrderCreatedJob
    {
        private readonly ITenantProvider _tenantProvider;
        private readonly IServiceProvider _sp;
        private readonly INotificationService _notification;

        public OrderCreatedJob(
            ITenantProvider tenantProvider,
            IServiceProvider sp,
            INotificationService notification)
        {
            _tenantProvider = tenantProvider;
            _sp = sp;
            _notification = notification;
        }

        public async Task Execute(string tenantId, string userId)
        {
            // 🔥 VERY IMPORTANT

            using var scope = _sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Example logic
            // var ordersCount = await db.Set<Order>().CountAsync();

            await _notification.SendToUserAsync(userId,
                $"Order processed. Total orders: {5000}");
        }
    }
}
