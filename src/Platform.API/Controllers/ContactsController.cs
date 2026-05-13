using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/contacts")]
    public class ContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ContactsController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var contacts = await _dbContext.Contacts
                .OrderBy(c => c.FullName)
                .ToListAsync();

            return Ok(contacts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var contact = await _dbContext.Contacts
                .Include(c => c.Interactions)
                .Include(c => c.Cases)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null) return NotFound();
            return Ok(contact);
        }

        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetClientSummary(Guid id)
        {
            var contact = await _dbContext.Contacts
                .Include(c => c.Cases)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null) return NotFound();

            var caseIds = contact.Cases.Select(c => c.Id).ToList();

            var totalInvoiced = await _dbContext.Invoices
                .Where(i => caseIds.Contains(i.LegalCaseId))
                .SumAsync(i => i.TotalAmount);

            var totalPaid = await _dbContext.Invoices
                .Where(i => caseIds.Contains(i.LegalCaseId))
                .SumAsync(i => i.PaidAmount);

            var trustBalance = await _dbContext.TrustTransactions
                .Where(t => caseIds.Contains(t.LegalCaseId))
                .SumAsync(t => t.Type == TrustTransactionType.Deposit ? t.Amount : -t.Amount);

            return Ok(new
            {
                ContactId = contact.Id,
                FullName = contact.FullName,
                TotalCases = contact.Cases.Count,
                ActiveCases = contact.Cases.Count(c => c.Status == CaseStatus.Active),
                TotalInvoiced = totalInvoiced,
                TotalPaid = totalPaid,
                OutstandingBalance = totalInvoiced - totalPaid,
                TrustBalance = trustBalance
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContactRequest request)
        {
            var contact = new Contact
            {
                FullName = request.FullName,
                Type = request.Type,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                IdentificationNumber = request.IdentificationNumber,
                Address = request.Address,
                CompanyName = request.CompanyName,
                JobTitle = request.JobTitle,
                IsClient = request.IsClient,
                Notes = request.Notes,
                Tags = request.Tags ?? new List<string>()
            };

            _dbContext.Contacts.Add(contact);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = contact.Id }, contact);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateContactRequest request)
        {
            var contact = await _dbContext.Contacts.FindAsync(id);
            if (contact == null) return NotFound();

            contact.FullName = request.FullName;
            contact.Type = request.Type;
            contact.Email = request.Email;
            contact.PhoneNumber = request.PhoneNumber;
            contact.IdentificationNumber = request.IdentificationNumber;
            contact.Address = request.Address;
            contact.CompanyName = request.CompanyName;
            contact.JobTitle = request.JobTitle;
            contact.IsClient = request.IsClient;
            contact.Notes = request.Notes;
            contact.Tags = request.Tags ?? new List<string>();

            await _dbContext.SaveChangesAsync();

            return Ok(contact);
        }

        // --- Interaction Log ---

        [HttpPost("{id}/interactions")]
        public async Task<IActionResult> AddInteraction(Guid id, [FromBody] CreateInteractionRequest request)
        {
            var contact = await _dbContext.Contacts.FindAsync(id);
            if (contact == null) return NotFound();

            var interaction = new ContactInteraction
            {
                ContactId = id,
                Type = request.Type,
                InteractionDate = request.InteractionDate,
                Description = request.Description,
                AuthorName = request.AuthorName
            };

            _dbContext.ContactInteractions.Add(interaction);
            await _dbContext.SaveChangesAsync();

            return Ok(interaction);
        }
    }

    public class CreateContactRequest
    {
        public string FullName { get; set; } = default!;
        public ContactType Type { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? IdentificationNumber { get; set; }
        public string? Address { get; set; }
        public string? CompanyName { get; set; }
        public string? JobTitle { get; set; }
        public bool IsClient { get; set; }
        public string? Notes { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class CreateInteractionRequest
    {
        public InteractionType Type { get; set; }
        public DateTime InteractionDate { get; set; }
        public string Description { get; set; } = default!;
        public string? AuthorName { get; set; }
    }
}
