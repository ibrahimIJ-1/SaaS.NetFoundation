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
    [Route("api/search")]
    public class SearchController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public SearchController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("global")]
        public async Task<IActionResult> GlobalSearch([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return Ok(new { });

            var term = query.ToLower();

            // 1. Search Cases
            var cases = await _dbContext.LegalCases
                .Where(c => c.Title.ToLower().Contains(term) || c.CaseNumber.ToLower().Contains(term) || c.ClientName.ToLower().Contains(term))
                .Select(c => new { c.Id, c.Title, c.CaseNumber, Type = "Case" })
                .Take(10)
                .ToListAsync();

            // 2. Search Contacts
            var contacts = await _dbContext.Contacts
                .Where(c => c.FullName.ToLower().Contains(term) || (c.Email != null && c.Email.ToLower().Contains(term)))
                .Select(c => new { c.Id, Name = c.FullName, Type = "Contact" })
                .Take(10)
                .ToListAsync();

            // 3. DEEP SEARCH: Document Content
            var documents = await _dbContext.CaseDocuments
                .Where(d => d.FileName.ToLower().Contains(term) || (d.ExtractedText != null && d.ExtractedText.ToLower().Contains(term)))
                .Select(d => new { d.Id, d.FileName, d.LegalCaseId, Type = "Document", HasMatchInContent = d.ExtractedText != null && d.ExtractedText.ToLower().Contains(term) })
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                Cases = cases,
                Contacts = contacts,
                Documents = documents
            });
        }

        [HttpGet("saved")]
        public async Task<IActionResult> GetSaved()
        {
            var userId = User.Identity?.Name ?? "system";
            var saved = await _dbContext.SavedSearches
                .Where(s => s.UserId == userId)
                .ToListAsync();
            return Ok(saved);
        }

        [HttpPost("saved")]
        public async Task<IActionResult> CreateSaved([FromBody] SavedSearch request)
        {
            request.UserId = User.Identity?.Name ?? "system";
            _dbContext.SavedSearches.Add(request);
            await _dbContext.SaveChangesAsync();
            return Ok(request);
        }

        [HttpDelete("saved/{id}")]
        public async Task<IActionResult> DeleteSaved(Guid id)
        {
            var saved = await _dbContext.SavedSearches.FindAsync(id);
            if (saved == null) return NotFound();

            _dbContext.SavedSearches.Remove(saved);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
