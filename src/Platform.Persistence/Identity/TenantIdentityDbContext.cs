using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence.Identity
{
    public class TenantIdentityDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
    {
        public TenantIdentityDbContext(DbContextOptions<TenantIdentityDbContext> options)
            : base(options) { }
    }
}
