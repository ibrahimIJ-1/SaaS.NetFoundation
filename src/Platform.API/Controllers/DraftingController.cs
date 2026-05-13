using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common.Interfaces;
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
    [Route("api/drafting")]
    public class DraftingController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly ApplicationDbContext _dbContext;

        public DraftingController(IAIService aiService, ApplicationDbContext dbContext)
        {
            _aiService = aiService;
            _dbContext = dbContext;
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = await _dbContext.LegalTemplates.ToListAsync();
            return Ok(templates);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateDraft([FromBody] DraftingRequest request)
        {
            var template = await _dbContext.LegalTemplates.FindAsync(request.TemplateId);
            if (template == null) return NotFound("Template not found");

            var legalCase = await _dbContext.LegalCases
                .Include(c => c.Opponents)
                .Include(c => c.Notes)
                .FirstOrDefaultAsync(c => c.Id == request.CaseId);

            if (legalCase == null) return NotFound("Case not found");

            var context = $"Template: {template.Name}\n" +
                          $"Category: {template.Category}\n" +
                          $"Case Details: {legalCase.Title}, Case No: {legalCase.CaseNumber}\n" +
                          $"Client: {legalCase.ClientName}\n" +
                          $"Parties: {string.Join(", ", legalCase.Opponents.Select(p => p.Name))}\n" +
                          $"Court: {legalCase.CourtInfo}";

            var prompt = $"Using the following template structure, generate a complete professional legal document draft for the specified case. " +
                         $"Ensure all placeholders are filled with case information. Maintain a formal legal tone in {template.Language}. " +
                         $"\n\nTEMPLATE STRUCTURE:\n{template.Content}\n\nCASE CONTEXT:\n{context}";

            var draft = await _aiService.Chat(prompt);

            return Ok(new { Draft = draft });
        }
    }

    public class DraftingRequest
    {
        public Guid TemplateId { get; set; }
        public Guid CaseId { get; set; }
    }
}
