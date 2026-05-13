using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Platform.Infrastructure.Realtime.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string receiverId, string message)
        {
            await Clients.Group($"user:{receiverId}").SendAsync("ReceiveMessage", Context.UserIdentifier, message);
        }

        public async Task JoinCaseGroup(string caseId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"case:{caseId}");
        }

        public async Task LeaveCaseGroup(string caseId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"case:{caseId}");
        }
    }
}
