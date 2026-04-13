using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Realtime.Interfaces
{
    public interface INotificationService
    {
        Task SendToTenantAsync(string tenantId, string message);
        Task SendToUserAsync(string userId, string message);
    }
}
