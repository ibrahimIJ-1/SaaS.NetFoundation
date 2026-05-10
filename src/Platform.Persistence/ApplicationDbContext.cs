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
        
        // Phase 2: Clinical
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<MedicalHistory> MedicalHistories => Set<MedicalHistory>();
        public DbSet<DentalChart> DentalCharts => Set<DentalChart>();
        public DbSet<ToothCondition> ToothConditions => Set<ToothCondition>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<Visit> Visits => Set<Visit>();
        public DbSet<TreatmentPlan> TreatmentPlans => Set<TreatmentPlan>();
        public DbSet<TreatmentPlanItem> TreatmentPlanItems => Set<TreatmentPlanItem>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<SessionRecord> SessionRecords => Set<SessionRecord>();
        public DbSet<Room> Rooms => Set<Room>();
        public DbSet<Chair> Chairs => Set<Chair>();
        public DbSet<InsuranceProvider> InsuranceProviders => Set<InsuranceProvider>();
        public DbSet<InsurancePolicy> InsurancePolicies => Set<InsurancePolicy>();
        public DbSet<InsuranceClaim> InsuranceClaims => Set<InsuranceClaim>();
        public DbSet<InventoryCategory> InventoryCategories => Set<InventoryCategory>();
        public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
        public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();
        public DbSet<LabProvider> LabProviders => Set<LabProvider>();
        public DbSet<LabOrder> LabOrders => Set<LabOrder>();
        public DbSet<LabWorkItem> LabWorkItems => Set<LabWorkItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<TenantFeature>()
                .HasIndex(f => f.FeatureKey)
                .IsUnique();

            // Configure 1-to-1 relationships
            modelBuilder.Entity<Patient>()
                .HasOne(p => p.MedicalHistory)
                .WithOne(m => m.Patient)
                .HasForeignKey<MedicalHistory>(m => m.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Patient>()
                .HasOne(p => p.DentalChart)
                .WithOne(d => d.Patient)
                .HasForeignKey<DentalChart>(d => d.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure 1-to-Many relationships
            modelBuilder.Entity<DentalChart>()
                .HasMany(d => d.ToothConditions)
                .WithOne(t => t.DentalChart)
                .HasForeignKey(t => t.DentalChartId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Patient>()
                .HasMany(p => p.Appointments)
                .WithOne(a => a.Patient)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Patient>()
                .HasMany(p => p.Visits)
                .WithOne(v => v.Patient)
                .HasForeignKey(v => v.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Visit)
                .WithOne(v => v.Appointment)
                .HasForeignKey<Visit>(v => v.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Patient>()
                .HasMany(p => p.TreatmentPlans)
                .WithOne(tp => tp.Patient)
                .HasForeignKey(tp => tp.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TreatmentPlan>()
                .HasMany(tp => tp.Items)
                .WithOne(i => i.TreatmentPlan)
                .HasForeignKey(i => i.TreatmentPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TreatmentPlanItem>()
                .HasOne(i => i.PerformedInVisit)
                .WithMany(v => v.PerformedProcedures)
                .HasForeignKey(i => i.PerformedInVisitId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.Items)
                .WithOne(ii => ii.Invoice)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.Payments)
                .WithOne(p => p.Invoice)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Visit)
                .WithMany()
                .HasForeignKey(i => i.VisitId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.TreatmentPlanItem)
                .WithMany()
                .HasForeignKey(ii => ii.TreatmentPlanItemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SessionRecord>()
                .HasOne(sr => sr.Visit)
                .WithMany(v => v.SessionRecords)
                .HasForeignKey(sr => sr.VisitId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionRecord>()
                .HasOne(sr => sr.TreatmentPlanItem)
                .WithMany(tpi => tpi.SessionRecords)
                .HasForeignKey(sr => sr.TreatmentPlanItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Room>()
                .HasMany(r => r.Chairs)
                .WithOne(c => c.Room)
                .HasForeignKey(c => c.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Chair)
                .WithMany()
                .HasForeignKey(a => a.ChairId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<InsurancePolicy>()
                .HasOne(p => p.Provider)
                .WithMany(ip => ip.Policies)
                .HasForeignKey(p => p.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InsuranceClaim>()
                .HasOne(c => c.Invoice)
                .WithMany()
                .HasForeignKey(c => c.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<InsuranceClaim>()
                .HasOne(c => c.Policy)
                .WithMany()
                .HasForeignKey(c => c.PolicyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InventoryItem>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockTransaction>()
                .HasOne(t => t.InventoryItem)
                .WithMany(p => p.Transactions)
                .HasForeignKey(t => t.InventoryItemId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LabOrder>()
                .HasOne(o => o.Provider)
                .WithMany(p => p.Orders)
                .HasForeignKey(o => o.LabProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LabWorkItem>()
                .HasOne(i => i.LabOrder)
                .WithMany(o => o.Items)
                .HasForeignKey(i => i.LabOrderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
