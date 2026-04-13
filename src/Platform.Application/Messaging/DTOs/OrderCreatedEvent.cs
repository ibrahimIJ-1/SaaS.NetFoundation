using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Messaging.DTOs
{
    public class OrderCreatedEvent
    {
        public string TenantId { get; set; } = default!;
        public string UserId { get; set; } = default!;
    }
}
