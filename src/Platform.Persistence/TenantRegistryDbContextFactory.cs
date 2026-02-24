using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Platform.Persistence.Tenants;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence
{
    public class TenantRegistryDbContextFactory
    : IDesignTimeDbContextFactory<TenantRegistryDbContext>
    {
        public TenantRegistryDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TenantRegistryDbContext>();

            optionsBuilder.UseSqlServer(
                "Server=BRROZ\\SQLEXPRESS;Database=Platform_MasterDb;Trusted_Connection=True;TrustServerCertificate=True;");

            return new TenantRegistryDbContext(optionsBuilder.Options);
        }
    }
}
