using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Application.Common.Interfaces;
using Platform.Domain.Entities.Legal;
using Platform.Infrastructure.Jobs.Handlers;
using Platform.Persistence;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/voice-recordings")]
    public class VoiceRecordingsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStorageService _storageService;
        private readonly ITenantProvider _tenantProvider;
        private readonly IBackgroundJobClient _backgroundJobs;

        public VoiceRecordingsController(
            ApplicationDbContext dbContext,
            IStorageService storageService,
            ITenantProvider tenantProvider,
            IBackgroundJobClient backgroundJobs)
        {
            _dbContext = dbContext;
            _storageService = storageService;
            _tenantProvider = tenantProvider;
            _backgroundJobs = backgroundJobs;
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] Guid legalCaseId, [FromQuery] Guid? courtSessionId = null)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No audio file provided.");

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("File size exceeds 10 MB limit.");

            var legalCase = await _dbContext.LegalCases.FindAsync(legalCaseId);
            if (legalCase == null) return NotFound("Case not found.");

            if (courtSessionId.HasValue)
            {
                var session = await _dbContext.CourtSessions.FindAsync(courtSessionId.Value);
                if (session == null) return NotFound("Session not found.");
            }

            var tenantId = _tenantProvider.CurrentTenant?.Id ?? "default";
            var storagePath = $"{tenantId}/voice-recordings/{legalCaseId}/{Guid.NewGuid()}_{file.FileName}";

            await using var stream = file.OpenReadStream();
            var fileUrl = await _storageService.UploadFileAsync(stream, storagePath, file.ContentType);

            var recording = new VoiceRecording
            {
                LegalCaseId = legalCaseId,
                CourtSessionId = courtSessionId,
                FileUrl = fileUrl,
                FileName = file.FileName,
                FileSizeBytes = file.Length,
                DurationSeconds = 0,
                TranscriptionStatus = TranscriptionStatus.Pending,
                RecordedAt = DateTime.UtcNow
            };

            _dbContext.VoiceRecordings.Add(recording);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = recording.Id }, recording);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var recording = await _dbContext.VoiceRecordings.FindAsync(id);
            if (recording == null) return NotFound();

            return Ok(recording);
        }

        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetByCase(Guid caseId)
        {
            var recordings = await _dbContext.VoiceRecordings
                .Where(v => v.LegalCaseId == caseId && v.CourtSessionId == null)
                .OrderByDescending(v => v.RecordedAt)
                .ToListAsync();

            return Ok(recordings);
        }

        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetBySession(Guid sessionId)
        {
            var recordings = await _dbContext.VoiceRecordings
                .Where(v => v.CourtSessionId == sessionId)
                .OrderByDescending(v => v.RecordedAt)
                .ToListAsync();

            return Ok(recordings);
        }

        [HttpPost("{id}/transcribe")]
        public async Task<IActionResult> EnqueueTranscription(Guid id)
        {
            var recording = await _dbContext.VoiceRecordings.FindAsync(id);
            if (recording == null) return NotFound();

            if (recording.TranscriptionStatus == TranscriptionStatus.Processing)
                return Conflict("Transcription is already in progress.");

            recording.TranscriptionStatus = TranscriptionStatus.Processing;
            await _dbContext.SaveChangesAsync();

            _backgroundJobs.Enqueue<TranscriptionJob>(job =>
                job.Execute(id));

            return Accepted(new { Message = "Transcription queued.", RecordingId = id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var recording = await _dbContext.VoiceRecordings.FindAsync(id);
            if (recording == null) return NotFound();

            await _storageService.DeleteFileAsync(recording.FileUrl);

            _dbContext.VoiceRecordings.Remove(recording);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
