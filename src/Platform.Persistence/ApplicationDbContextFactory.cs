using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence
{
    public class ApplicationDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            // Temporary connection used ONLY for generating migrations
            optionsBuilder.UseSqlServer(
                "Server=BRROZ\\SQLEXPRESS;Database=Platform_TenantTemplate;Trusted_Connection=True;TrustServerCertificate=True;");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
