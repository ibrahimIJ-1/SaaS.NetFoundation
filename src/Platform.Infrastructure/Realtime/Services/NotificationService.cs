using Microsoft.AspNetCore.SignalR;
using Platform.Application.Realtime.Interfaces;
using Platform.Infrastructure.Realtime.Hubs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Infrastructure.Realtime.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hub;

        public NotificationService(IHubContext<NotificationHub> hub)
        {
            _hub = hub;
        }

        public async Task SendToTenantAsync(string tenantId, string message)
        {
            await _hub.Clients.Group($"tenant:{tenantId}")
                .SendAsync("ReceiveMessage", message);
        }

        public async Task SendToUserAsync(string userId, string message)
        {
            await _hub.Clients.Group($"user:{userId}")
                .SendAsync("ReceiveMessage", message);
        }
    }
}
