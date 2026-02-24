using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Domain.Tenants
{
    public class Tenant : Common.BaseEntity
    {
        public string Name { get;  set; } = default!;
        public string Identifier { get;  set; } = default!; // subdomain or key
        public string ConnectionString { get;  set; } = default!;
        public bool IsActive { get;  set; }

        public Tenant() { }

        public Tenant(string name, string identifier, string connectionString)
        {
            Name = name;
            Identifier = identifier;
            ConnectionString = connectionString;
            IsActive = true;
        }
    }
}
