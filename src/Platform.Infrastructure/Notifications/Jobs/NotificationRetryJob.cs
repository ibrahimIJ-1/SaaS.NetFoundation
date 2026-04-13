using Platform.Application.Notifications.Interfaces;
using Platform.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Platform.Infrastructure.Notifications.Jobs
{
    public class NotificationRetryJob
    {
        private readonly ApplicationDbContext _db;
        private readonly INotificationService _notification;

        public NotificationRetryJob(
            ApplicationDbContext db,
            INotificationService notification)
        {
            _db = db;
            _notification = notification;
        }

        public async Task Execute()
        {
            var failedNotifications = await _db.Notifications
                .Where(n => !n.IsDelivered)
                .ToListAsync();

            foreach (var n in failedNotifications)
            {
                await _notification.SendToUserAsync(n.UserId, n.Message);
            }
        }
    }
}
