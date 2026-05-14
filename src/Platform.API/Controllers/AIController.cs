using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common.Interfaces;
using Platform.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly ApplicationDbContext _dbContext;

        public AIController(IAIService aiService, ApplicationDbContext dbContext)
        {
            _aiService = aiService;
            _dbContext = dbContext;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AIChatRequest request)
        {
            var response = await _aiService.Chat(request.Prompt, request.Context);
            return Ok(new { Response = response });
        }

        [HttpPost("summarize-case/{caseId}")]
        public async Task<IActionResult> SummarizeCase(Guid caseId)
        {
            var legalCase = await _dbContext.LegalCases
                .Include(c => c.Notes)
                .Include(c => c.Stages)
                .FirstOrDefaultAsync(c => c.Id == caseId);

            if (legalCase == null) return NotFound();

            var caseContext = $"Case Title: {legalCase.Title}\n" +
                              $"Type: {legalCase.CaseType}\n" +
                              $"Status: {legalCase.Status}\n" +
                              $"Description: {legalCase.Description}\n" +
                              $"Notes: {string.Join("\n", legalCase.Notes.Select(n => n.NoteText))}";

            var summary = await _aiService.SummarizeLegalText(caseContext);
            return Ok(new { Summary = summary });
        }

        [HttpPost("analyze-text")]
        public async Task<IActionResult> AnalyzeText([FromBody] AnalyzeTextRequest request)
        {
            var analysis = await _aiService.AnalyzeDocument(request.Text);
            return Ok(new { Analysis = analysis });
        }

        [HttpPost("transcribe")]
        public async Task<IActionResult> Transcribe([FromForm] Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No audio file provided.");

            using var stream = file.OpenReadStream();
            var transcription = await _aiService.TranscribeVoice(stream);

            return Ok(new { Transcription = transcription });
        }
    }

    public class AIChatRequest
    {
        public string Prompt { get; set; } = default!;
        public string? Context { get; set; }
    }

    public class AnalyzeTextRequest
    {
        public string Text { get; set; } = default!;
    }
}
