using Microsoft.AspNetCore.SignalR;
using Platform.Application.Realtime.Interfaces;
using Platform.Infrastructure.Realtime.Hubs;
using Platform.Persistence;
using Platform.Persistence.Notifications;


namespace Platform.Infrastructure.Notifications
{
    public class NotificationService(
        IHubContext<NotificationHub> hub,
        ApplicationDbContext db) : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hub = hub;
        private readonly ApplicationDbContext _db = db;

        public async Task SendToUserAsync(string userId, string message)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                IsDelivered = false
            };

            // 1️⃣ Save first
            _db.Notifications.Add(notification);
            await _db.SaveChangesAsync();

            try
            {
                // 2️⃣ Try real-time send
                await _hub.Clients.Group($"user:{userId}")
                    .SendAsync("ReceiveMessage", message);

                // 3️⃣ Mark as delivered
                notification.IsDelivered = true;
                await _db.SaveChangesAsync();
            }
            catch
            {
                // ❌ Don't mark delivered → will retry later
            }
        }
        public async Task SendToTenantAsync(string tenantId, string message)
        {
            await _hub.Clients.Group($"tenant:{tenantId}")
                .SendAsync("ReceiveMessage", message);
        }
    }
}
