using Microsoft.AspNetCore.SignalR;
using Platform.Application.Abstractions;

namespace Platform.Infrastructure.Realtime.Hubs
{


    public class NotificationHub : Hub
    {
        private readonly ITenantProvider _tenantProvider;

        public NotificationHub(ITenantProvider tenantProvider)
        {
            _tenantProvider = tenantProvider;
        }

        public override async Task OnConnectedAsync()
        {
            var tenantId = _tenantProvider.CurrentTenant?.Id;
            var userId = Context.UserIdentifier;

            if (tenantId != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"tenant:{tenantId}");
            }

            if (userId != null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");
            }

            await base.OnConnectedAsync();
        }
    }
}
