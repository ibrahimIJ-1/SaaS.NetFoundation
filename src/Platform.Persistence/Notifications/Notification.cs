using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence.Notifications
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = default!;
        public string Message { get; set; } = default!;
        public bool IsDelivered { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
