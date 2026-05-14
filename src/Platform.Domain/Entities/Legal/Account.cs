using Platform.Domain.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Platform.Domain.Entities.Legal
{
    public enum AccountType
    {
        Asset,
        Liability,
        Equity,
        Revenue,
        Expense
    }

    public enum AccountCategory
    {
        CurrentAsset,
        FixedAsset,
        CurrentLiability,
        LongTermLiability,
        Equity,
        OperatingRevenue,
        OtherRevenue,
        OperatingExpense,
        AdministrativeExpense,
        OtherExpense
    }

    public class Account : BaseEntity
    {
        [Required, MaxLength(20)]
        public string AccountCode { get; set; } = default!;

        [Required, MaxLength(200)]
        public string AccountName { get; set; } = default!;

        public AccountType Type { get; set; }
        public AccountCategory Category { get; set; }

        public Guid? ParentAccountId { get; set; }
        public virtual Account? ParentAccount { get; set; }
        public virtual ICollection<Account> Children { get; set; } = new List<Account>();

        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }

        [InverseProperty("Account")]
        public virtual ICollection<JournalEntryLine> JournalEntryLines { get; set; } = new List<JournalEntryLine>();
    }
}
