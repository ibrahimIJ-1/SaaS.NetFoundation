using System.Collections.Generic;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class Room : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        
        public ICollection<Chair> Chairs { get; set; } = new List<Chair>();

        public Room() { }

        public Room(string name)
        {
            Name = name;
        }
    }
}
