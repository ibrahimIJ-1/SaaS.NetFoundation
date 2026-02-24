using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Product> Products => Set<Product>();
        // Your tenant tables will go here
    }
}
