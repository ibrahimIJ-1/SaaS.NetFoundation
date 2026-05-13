using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Platform.Infrastructure.Realtime.Hubs;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/chat")]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHubContext<ChatHub> _chatHubContext;

        public ChatController(ApplicationDbContext dbContext, IHubContext<ChatHub> chatHubContext)
        {
            _dbContext = dbContext;
            _chatHubContext = chatHubContext;
        }

        [HttpGet("history/{otherUserId}")]
        public async Task<IActionResult> GetHistory(string otherUserId, [FromQuery] Guid? caseId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var query = _dbContext.ChatMessages
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == otherUserId) || 
                            (m.SenderId == otherUserId && m.ReceiverId == currentUserId));

            if (caseId.HasValue)
            {
                query = query.Where(m => m.LegalCaseId == caseId.Value);
            }

            var messages = await query
                .OrderBy(m => m.CreatedOn)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var message = new ChatMessage
            {
                SenderId = currentUserId!,
                ReceiverId = request.ReceiverId,
                Content = request.Content,
                LegalCaseId = request.LegalCaseId
            };

            _dbContext.ChatMessages.Add(message);
            await _dbContext.SaveChangesAsync();

            // Real-time delivery via SignalR
            await _chatHubContext.Clients.Group($"user:{request.ReceiverId}")
                .SendAsync("ReceiveMessage", currentUserId, request.Content, request.LegalCaseId);

            return Ok(message);
        }
    }

    public class SendMessageRequest
    {
        public string ReceiverId { get; set; } = default!;
        public string Content { get; set; } = default!;
        public Guid? LegalCaseId { get; set; }
    }
}
