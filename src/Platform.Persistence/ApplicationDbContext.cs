using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities;
using Platform.Domain.Clinical;
using Platform.Persistence.Notifications;

namespace Platform.Persistence
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<TenantFeature> TenantFeatures => Set<TenantFeature>();
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<TenantFeature>()
                .HasIndex(f => f.FeatureKey)
                .IsUnique();
        }
    }
}
