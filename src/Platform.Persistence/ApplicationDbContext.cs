using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities;
using Platform.Domain.Entities.Legal;
using Platform.Persistence.Notifications;

namespace Platform.Persistence
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<TenantFeature> TenantFeatures => Set<TenantFeature>();
        
        // Legal Entities
        public DbSet<LegalCase> LegalCases => Set<LegalCase>();
        public DbSet<Opponent> Opponents => Set<Opponent>();
        public DbSet<CaseStage> CaseStages => Set<CaseStage>();
        public DbSet<CourtSession> CourtSessions => Set<CourtSession>();
        public DbSet<CaseNote> CaseNotes => Set<CaseNote>();
        public DbSet<CaseDocument> CaseDocuments => Set<CaseDocument>();
        public DbSet<LegalTask> LegalTasks => Set<LegalTask>();
        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<TrustTransaction> TrustTransactions => Set<TrustTransaction>();
        public DbSet<Contact> Contacts => Set<Contact>();
        public DbSet<ContactInteraction> ContactInteractions => Set<ContactInteraction>();
        public DbSet<DocumentHighlight> DocumentHighlights => Set<DocumentHighlight>();
        public DbSet<DocumentAnnotation> DocumentAnnotations => Set<DocumentAnnotation>();
        public DbSet<Expense> Expenses => Set<Expense>();
        public DbSet<CommissionRule> CommissionRules => Set<CommissionRule>();
        public DbSet<SavedSearch> SavedSearches => Set<SavedSearch>();
        public DbSet<KnowledgeArticle> KnowledgeArticles => Set<KnowledgeArticle>();
        public DbSet<LegalTemplate> LegalTemplates => Set<LegalTemplate>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<DocumentSignature> DocumentSignatures => Set<DocumentSignature>();
        public DbSet<DocumentVideoAnnotation> DocumentVideoAnnotations => Set<DocumentVideoAnnotation>();

        // Workflow & Transactions
        public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
        public DbSet<WorkflowStepDefinition> WorkflowStepDefinitions => Set<WorkflowStepDefinition>();
        public DbSet<LegalTransaction> LegalTransactions => Set<LegalTransaction>();
        public DbSet<TransactionStepInstance> TransactionStepInstances => Set<TransactionStepInstance>();
        public DbSet<Currency> Currencies => Set<Currency>();
        
        // Double-Entry Accounting
        public DbSet<Account> Accounts => Set<Account>();
        public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
        public DbSet<JournalEntryLine> JournalEntryLines => Set<JournalEntryLine>();
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<TenantFeature>()
                .HasIndex(f => f.FeatureKey)
                .IsUnique();
                
            modelBuilder.Entity<LegalCase>()
                .HasIndex(c => c.CaseNumber)
                .IsUnique();
                
            modelBuilder.Entity<LegalCase>()
                .Property(c => c.Tags)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new System.Collections.Generic.List<string>()
                );
                
            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Opponents)
                .WithOne(o => o.LegalCase)
                .HasForeignKey(o => o.LegalCaseId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Stages)
                .WithOne(s => s.LegalCase)
                .HasForeignKey(s => s.LegalCaseId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Sessions)
                .WithOne(s => s.LegalCase)
                .HasForeignKey(s => s.LegalCaseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Notes)
                .WithOne(n => n.LegalCase)
                .HasForeignKey(n => n.LegalCaseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Documents)
                .WithOne(d => d.LegalCase)
                .HasForeignKey(d => d.LegalCaseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Invoices)
                .WithOne(i => i.LegalCase)
                .HasForeignKey(i => i.LegalCaseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.TrustTransactions)
                .WithOne(t => t.LegalCase)
                .HasForeignKey(t => t.LegalCaseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasMany(i => i.Items)
                .WithOne(item => item.Invoice)
                .HasForeignKey(item => item.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasMany<Payment>()
                .WithOne(p => p.Invoice)
                .HasForeignKey(p => p.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Contact>()
                .Property(c => c.Tags)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new System.Collections.Generic.List<string>()
                );

            modelBuilder.Entity<Contact>()
                .HasMany(c => c.Cases)
                .WithOne(caseObj => caseObj.Contact)
                .HasForeignKey(caseObj => caseObj.ContactId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Contact>()
                .HasMany(c => c.Interactions)
                .WithOne(i => i.Contact)
                .HasForeignKey(i => i.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CaseDocument>()
                .HasMany(d => d.Highlights)
                .WithOne(h => h.Document)
                .HasForeignKey(h => h.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CaseDocument>()
                .HasMany(d => d.Annotations)
                .WithOne(a => a.Document)
                .HasForeignKey(a => a.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CaseDocument>()
                .HasMany(d => d.VideoAnnotations)
                .WithOne(v => v.Document)
                .HasForeignKey(v => v.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LegalCase>()
                .HasMany(c => c.Expenses)
                .WithOne(e => e.LegalCase)
                .HasForeignKey(e => e.LegalCaseId)
                .OnDelete(DeleteBehavior.SetNull);

            // Workflow Definitions
            modelBuilder.Entity<WorkflowDefinition>()
                .HasMany(w => w.Steps)
                .WithOne(s => s.WorkflowDefinition)
                .HasForeignKey(s => s.WorkflowDefinitionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkflowStepDefinition>()
                .Property(s => s.RequiredFileNames)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new System.Collections.Generic.List<string>()
                );

            modelBuilder.Entity<WorkflowStepDefinition>()
                .Property(s => s.DefaultAssigneeContactIds)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new System.Collections.Generic.List<string>()
                );

            // Legal Transactions
            modelBuilder.Entity<LegalTransaction>()
                .HasIndex(t => t.TransactionNumber)
                .IsUnique();

            modelBuilder.Entity<LegalTransaction>()
                .HasMany(t => t.Steps)
                .WithOne(s => s.LegalTransaction)
                .HasForeignKey(s => s.LegalTransactionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LegalTransaction>()
                .HasOne(t => t.Contact)
                .WithMany()
                .HasForeignKey(t => t.ContactId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<TransactionStepInstance>()
                .HasOne(s => s.StepDefinition)
                .WithMany()
                .HasForeignKey(s => s.StepDefinitionId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<LegalTransaction>()
                .HasOne(t => t.WorkflowDefinition)
                .WithMany()
                .HasForeignKey(t => t.WorkflowDefinitionId)
                .OnDelete(DeleteBehavior.Restrict);
 
            // Currency relationships
            modelBuilder.Entity<Currency>()
                .HasMany(c => c.WorkflowDefinitions)
                .WithOne(w => w.Currency)
                .HasForeignKey(w => w.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Currency>()
                .HasMany(c => c.Transactions)
                .WithOne(t => t.Currency)
                .HasForeignKey(t => t.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Currency>()
                .HasMany(c => c.TransactionStepInstances)
                .WithOne(s => s.Currency)
                .HasForeignKey(s => s.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Currency>()
                .HasMany(c => c.Invoices)
                .WithOne(i => i.Currency)
                .HasForeignKey(i => i.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Currency>()
                .HasMany(c => c.Payments)
                .WithOne(p => p.Currency)
                .HasForeignKey(p => p.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Currency>()
                .HasMany(c => c.Expenses)
                .WithOne(e => e.Currency)
                .HasForeignKey(e => e.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Currency>()
                .HasMany(c => c.TrustTransactions)
                .WithOne(t => t.Currency)
                .HasForeignKey(t => t.CurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Account hierarchy (self-referencing)
            modelBuilder.Entity<Account>()
                .HasMany(a => a.Children)
                .WithOne(a => a.ParentAccount)
                .HasForeignKey(a => a.ParentAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Account>()
                .HasIndex(a => a.AccountCode)
                .IsUnique();

            // Journal Entry
            modelBuilder.Entity<JournalEntry>()
                .HasIndex(e => e.EntryNumber)
                .IsUnique();

            modelBuilder.Entity<JournalEntry>()
                .HasMany(e => e.Lines)
                .WithOne(l => l.JournalEntry)
                .HasForeignKey(l => l.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Journal Entry Line
            modelBuilder.Entity<JournalEntryLine>()
                .HasOne(l => l.Account)
                .WithMany(a => a.JournalEntryLines)
                .HasForeignKey(l => l.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
