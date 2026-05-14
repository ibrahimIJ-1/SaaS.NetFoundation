using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public class PostingService : IPostingService
    {
        private readonly ApplicationDbContext _db;

        public PostingService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task PostInvoiceCreatedAsync(Guid invoiceId)
        {
            var invoice = await _db.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == invoiceId)
                ?? throw new InvalidOperationException("Invoice not found.");

            if (invoice.Status != InvoiceStatus.Sent && invoice.Status != InvoiceStatus.Partial && invoice.Status != InvoiceStatus.Paid)
                return; // Only post when invoice is sent or paid

            var (arAccountId, revenueAccountId) = await GetOrCreateDefaultAccountsAsync();

            var entryNumber = await GenerateEntryNumberAsync();
            var entry = new JournalEntry
            {
                EntryNumber = entryNumber,
                EntryDate = invoice.IssueDate,
                Description = $"فاتورة #{invoice.InvoiceNumber} - إيرادات قانونية",
                Type = JournalEntryType.Invoice,
                ReferenceId = invoice.Id,
                ReferenceType = "Invoice",
                IsPosted = true
            };

            // Debit: Accounts Receivable
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccountId,
                Debit = invoice.TotalAmount,
                Credit = 0,
                Description = $"فاتورة #{invoice.InvoiceNumber}",
                ExchangeRate = invoice.ExchangeRate
            });

            // Credit: Revenue (Legal Fees Income)
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = revenueAccountId,
                Debit = 0,
                Credit = invoice.TotalAmount,
                Description = $"فاتورة #{invoice.InvoiceNumber}",
                ExchangeRate = invoice.ExchangeRate
            });

            _db.Set<JournalEntry>().Add(entry);
            await _db.SaveChangesAsync();
        }

        public async Task PostPaymentRecordedAsync(Guid paymentId)
        {
            var payment = await _db.Payments
                .Include(p => p.Invoice)
                .FirstOrDefaultAsync(p => p.Id == paymentId)
                ?? throw new InvalidOperationException("Payment not found.");

            var (cashAccountId, arAccountId) = await GetOrCreateDefaultAccountsAsync();

            var entryNumber = await GenerateEntryNumberAsync();
            var entry = new JournalEntry
            {
                EntryNumber = entryNumber,
                EntryDate = payment.PaymentDate,
                Description = $"دفعة على الفاتورة #{payment.Invoice.InvoiceNumber}",
                Type = JournalEntryType.Payment,
                ReferenceId = payment.Id,
                ReferenceType = "Payment",
                IsPosted = true
            };

            // Debit: Cash/Bank
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccountId,
                Debit = payment.Amount,
                Credit = 0,
                Description = $"دفعة #{payment.ReferenceNumber ?? payment.Id.ToString().Substring(0, 8)}",
                ExchangeRate = payment.ExchangeRate
            });

            // Credit: Accounts Receivable
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccountId,
                Debit = 0,
                Credit = payment.Amount,
                Description = $"تسوية الفاتورة #{payment.Invoice.InvoiceNumber}",
                ExchangeRate = payment.ExchangeRate
            });

            _db.Set<JournalEntry>().Add(entry);
            await _db.SaveChangesAsync();
        }

        public async Task PostExpenseRecordedAsync(Guid expenseId)
        {
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == expenseId)
                ?? throw new InvalidOperationException("Expense not found.");

            var (cashAccountId, _) = await GetOrCreateDefaultAccountsAsync();
            var expenseAccountId = await GetOrCreateExpenseAccountAsync(expense.Category);

            var entryNumber = await GenerateEntryNumberAsync();
            var entry = new JournalEntry
            {
                EntryNumber = entryNumber,
                EntryDate = expense.ExpenseDate,
                Description = $"مصروف: {expense.Description}",
                Type = JournalEntryType.Expense,
                ReferenceId = expense.Id,
                ReferenceType = "Expense",
                IsPosted = true
            };

            // Debit: Expense account
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = expenseAccountId,
                Debit = expense.Amount,
                Credit = 0,
                Description = expense.Description,
                ExchangeRate = expense.ExchangeRate
            });

            // Credit: Cash/Bank
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = cashAccountId,
                Debit = 0,
                Credit = expense.Amount,
                Description = expense.Description,
                ExchangeRate = expense.ExchangeRate
            });

            _db.Set<JournalEntry>().Add(entry);
            await _db.SaveChangesAsync();
        }

        public async Task PostTrustTransactionAsync(Guid trustTransactionId)
        {
            var tt = await _db.TrustTransactions
                .FirstOrDefaultAsync(t => t.Id == trustTransactionId)
                ?? throw new InvalidOperationException("Trust transaction not found.");

            var (cashAccountId, _) = await GetOrCreateDefaultAccountsAsync();
            var trustLiabilityAccountId = await GetOrCreateTrustLiabilityAccountAsync();

            var entryNumber = await GenerateEntryNumberAsync();
            var entry = new JournalEntry
            {
                EntryNumber = entryNumber,
                EntryDate = tt.TransactionDate,
                Description = tt.Type == TrustTransactionType.Deposit
                    ? $"إيداع أمانة: {tt.Description}"
                    : $"سحب أمانة: {tt.Description}",
                Type = JournalEntryType.Trust,
                ReferenceId = tt.Id,
                ReferenceType = "Trust",
                IsPosted = true
            };

            if (tt.Type == TrustTransactionType.Deposit)
            {
                // Debit: Cash, Credit: Trust Liability
                entry.Lines.Add(new JournalEntryLine
                {
                    AccountId = cashAccountId,
                    Debit = tt.Amount,
                    Credit = 0,
                    Description = tt.Description,
                    ExchangeRate = tt.ExchangeRate
                });
                entry.Lines.Add(new JournalEntryLine
                {
                    AccountId = trustLiabilityAccountId,
                    Debit = 0,
                    Credit = tt.Amount,
                    Description = tt.Description,
                    ExchangeRate = tt.ExchangeRate
                });
            }
            else
            {
                // Debit: Trust Liability, Credit: Cash
                entry.Lines.Add(new JournalEntryLine
                {
                    AccountId = trustLiabilityAccountId,
                    Debit = tt.Amount,
                    Credit = 0,
                    Description = tt.Description,
                    ExchangeRate = tt.ExchangeRate
                });
                entry.Lines.Add(new JournalEntryLine
                {
                    AccountId = cashAccountId,
                    Debit = 0,
                    Credit = tt.Amount,
                    Description = tt.Description,
                    ExchangeRate = tt.ExchangeRate
                });
            }

            _db.Set<JournalEntry>().Add(entry);
            await _db.SaveChangesAsync();
        }

        public async Task PostInvoiceCancelledAsync(Guid invoiceId)
        {
            var invoice = await _db.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == invoiceId)
                ?? throw new InvalidOperationException("Invoice not found.");

            var (arAccountId, revenueAccountId) = await GetOrCreateDefaultAccountsAsync();

            var entryNumber = await GenerateEntryNumberAsync();
            var entry = new JournalEntry
            {
                EntryNumber = entryNumber,
                EntryDate = DateTime.UtcNow,
                Description = $"إلغاء الفاتورة #{invoice.InvoiceNumber}",
                Type = JournalEntryType.Adjustment,
                ReferenceId = invoice.Id,
                ReferenceType = "Invoice",
                IsPosted = true
            };

            // Reverse: Debit Revenue, Credit AR
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = revenueAccountId,
                Debit = invoice.TotalAmount,
                Credit = 0,
                Description = $"إلغاء الفاتورة #{invoice.InvoiceNumber}",
                ExchangeRate = invoice.ExchangeRate
            });
            entry.Lines.Add(new JournalEntryLine
            {
                AccountId = arAccountId,
                Debit = 0,
                Credit = invoice.TotalAmount,
                Description = $"إلغاء الفاتورة #{invoice.InvoiceNumber}",
                ExchangeRate = invoice.ExchangeRate
            });

            _db.Set<JournalEntry>().Add(entry);
            await _db.SaveChangesAsync();
        }

        public async Task PostInvoiceStatusChangedAsync(Guid invoiceId, string oldStatus, string newStatus)
        {
            if (oldStatus == "Draft" && (newStatus == "Sent" || newStatus == "Partial" || newStatus == "Paid"))
            {
                await PostInvoiceCreatedAsync(invoiceId);
            }
            else if (newStatus == "Cancelled" && oldStatus != "Draft")
            {
                await PostInvoiceCancelledAsync(invoiceId);
            }
        }

        private async Task<(Guid arId, Guid revenueId)> GetOrCreateDefaultAccountsAsync()
        {
            var arAccount = await _db.Set<Account>().FirstOrDefaultAsync(a => a.AccountCode == "1300");
            if (arAccount == null)
            {
                arAccount = new Account
                {
                    AccountCode = "1300",
                    AccountName = "حسابات مدينة - أتعاب محاماة",
                    Type = AccountType.Asset,
                    Category = AccountCategory.CurrentAsset,
                    IsActive = true,
                    Description = "المبالغ المستحقة على الموكلين"
                };
                _db.Set<Account>().Add(arAccount);
            }

            var revenueAccount = await _db.Set<Account>().FirstOrDefaultAsync(a => a.AccountCode == "4100");
            if (revenueAccount == null)
            {
                revenueAccount = new Account
                {
                    AccountCode = "4100",
                    AccountName = "إيرادات أتعاب محاماة",
                    Type = AccountType.Revenue,
                    Category = AccountCategory.OperatingRevenue,
                    IsActive = true,
                    Description = "إيرادات القضايا والاستشارات القانونية"
                };
                _db.Set<Account>().Add(revenueAccount);
            }

            var cashAccount = await _db.Set<Account>().FirstOrDefaultAsync(a => a.AccountCode == "1100");
            if (cashAccount == null)
            {
                cashAccount = new Account
                {
                    AccountCode = "1100",
                    AccountName = "نقدي - صندوق المكتب",
                    Type = AccountType.Asset,
                    Category = AccountCategory.CurrentAsset,
                    IsActive = true,
                    Description = "النقدية المتوفرة في صندوق المكتب"
                };
                _db.Set<Account>().Add(cashAccount);
            }

            await _db.SaveChangesAsync();

            return (arAccount.Id, revenueAccount.Id);
        }

        private async Task<Guid> GetOrCreateExpenseAccountAsync(string category)
        {
            var code = category switch
            {
                "CourtFees" or "رسوم محكمة" => "5300",
                "Travel" or "مواصلات" => "5400",
                "OfficeRent" or "إيجار المكتب" => "5100",
                "Utilities" or "خدمات" => "5200",
                "Stationery" or "قرطاسية" => "5500",
                "Marketing" or "تسويق" => "5600",
                _ => "5900"
            };

            var name = category switch
            {
                "CourtFees" or "رسوم محكمة" => "رسوم ودعاوى قضائية",
                "Travel" or "مواصلات" => "مصاريف سفر وانتقالات",
                "OfficeRent" or "إيجار المكتب" => "إيجار المكتب",
                "Utilities" or "خدمات" => "خدمات (كهرباء/ماء/إنترنت)",
                "Stationery" or "قرطاسية" => "قرطاسية ومستلزمات مكتبية",
                "Marketing" or "تسويق" => "مصاريف تسويق وإعلان",
                _ => "مصاريف متنوعة"
            };

            var account = await _db.Set<Account>().FirstOrDefaultAsync(a => a.AccountCode == code);
            if (account == null)
            {
                account = new Account
                {
                    AccountCode = code,
                    AccountName = name,
                    Type = AccountType.Expense,
                    Category = AccountCategory.OperatingExpense,
                    IsActive = true
                };
                _db.Set<Account>().Add(account);
                await _db.SaveChangesAsync();
            }

            return account.Id;
        }

        private async Task<Guid> GetOrCreateTrustLiabilityAccountAsync()
        {
            var account = await _db.Set<Account>().FirstOrDefaultAsync(a => a.AccountCode == "2300");
            if (account == null)
            {
                account = new Account
                {
                    AccountCode = "2300",
                    AccountName = "أمانات موكلين",
                    Type = AccountType.Liability,
                    Category = AccountCategory.CurrentLiability,
                    IsActive = true,
                    Description = "المبالغ المودعة من قبل الموكلين لحين صرفها"
                };
                _db.Set<Account>().Add(account);
                await _db.SaveChangesAsync();
            }
            return account.Id;
        }

        private async Task<string> GenerateEntryNumberAsync()
        {
            var today = DateTime.UtcNow;
            var prefix = $"JE-{today:yyyyMMdd}-";
            var lastEntry = await _db.Set<JournalEntry>()
                .Where(e => e.EntryNumber.StartsWith(prefix))
                .OrderByDescending(e => e.EntryNumber)
                .FirstOrDefaultAsync();

            int seq = 1;
            if (lastEntry != null && int.TryParse(lastEntry.EntryNumber[^4..], out var lastSeq))
                seq = lastSeq + 1;

            return $"{prefix}{seq:D4}";
        }
    }
}
