using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities;
using Platform.Persistence.Notifications;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Persistence
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<IdentityUser>(options)
    {
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Notification> Notifications => Set<Notification>();
        // Your tenant tables will go here
    }
}
