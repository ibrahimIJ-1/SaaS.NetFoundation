using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Notifications.Interfaces
{
    public interface INotificationService
    {
        Task SendToUserAsync(string userId, string message);
    }
}
