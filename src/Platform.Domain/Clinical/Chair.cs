using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class Chair : BaseEntity
    {
        public string Name { get; set; } = default!;
        
        public Guid RoomId { get; set; }
        public Room Room { get; set; } = null!;

        public bool IsOperational { get; set; } = true;

        public Chair() { }

        public Chair(string name, Guid roomId)
        {
            Name = name;
            RoomId = roomId;
        }
    }
}
