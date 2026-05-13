using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public class Contact : AuditableEntity
    {
        [Required]
        public string FullName { get; set; } = default!;

        public ContactType Type { get; set; } = ContactType.Individual;

        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? IdentificationNumber { get; set; } // ID Card, Passport, License
        public string? Address { get; set; }
        public string? CompanyName { get; set; }
        public string? JobTitle { get; set; }

        public bool IsClient { get; set; } = true;
        public string? Notes { get; set; }

        public virtual ICollection<LegalCase> Cases { get; set; } = new List<LegalCase>();
        public virtual ICollection<ContactInteraction> Interactions { get; set; } = new List<ContactInteraction>();
        
        public List<string> Tags { get; set; } = new List<string>();
    }

    public enum ContactType
    {
        Individual,
        Organization,
        Government
    }
}
