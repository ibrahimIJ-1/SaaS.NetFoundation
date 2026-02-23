using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Domain.Tenants
{
    public class Tenant : Common.BaseEntity
    {
        public string Name { get; private set; } = default!;
        public string Identifier { get; private set; } = default!; // subdomain or key
        public string ConnectionString { get; private set; } = default!;
        public bool IsActive { get; private set; }

        private Tenant() { }

        public Tenant(string name, string identifier, string connectionString)
        {
            Name = name;
            Identifier = identifier;
            ConnectionString = connectionString;
            IsActive = true;
        }
    }
}
