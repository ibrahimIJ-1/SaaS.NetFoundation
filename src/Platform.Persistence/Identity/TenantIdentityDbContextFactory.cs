using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence.Identity
{
    public class TenantIdentityDbContextFactory
    : IDesignTimeDbContextFactory<TenantIdentityDbContext>
    {
        public TenantIdentityDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TenantIdentityDbContext>();

            optionsBuilder.UseSqlServer(
                "Server=BRROZ\\SQLEXPRESS;Database=TenantIdentityTemplateDb;Trusted_Connection=True;MultipleActiveResultSets=true");

            return new TenantIdentityDbContext(optionsBuilder.Options);
        }
    }
}
