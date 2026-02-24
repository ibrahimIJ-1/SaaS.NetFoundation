using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Domain.Entities
{
    public class Product : AuditableEntity
    {
        public string Name { get; private set; } = default!;
        public decimal Price { get; private set; }

        private Product() { }

        public Product(string name, decimal price)
        {
            Name = name;
            Price = price;
        }
    }
}
