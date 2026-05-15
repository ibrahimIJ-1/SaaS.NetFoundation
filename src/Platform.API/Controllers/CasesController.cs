using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/cases")]
    public class CasesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStorageService _storageService;
        private readonly ITenantProvider _tenantProvider;

        public CasesController(ApplicationDbContext dbContext, IStorageService storageService, ITenantProvider tenantProvider)
        {
            _dbContext = dbContext;
            _storageService = storageService;
            _tenantProvider = tenantProvider;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var query = _dbContext.LegalCases.AsQueryable();

            // Filter for Client Portal
            var contactIdStr = User.FindFirstValue("contactId");
            if (!string.IsNullOrEmpty(contactIdStr) && Guid.TryParse(contactIdStr, out var contactId))
            {
                query = query.Where(c => c.ContactId == contactId);
            }

            var cases = await query
                .OrderByDescending(c => c.CreatedOn)
                .Select(c => new
                {
                    c.Id,
                    c.CaseNumber,
                    c.Title,
                    c.ClientName,
                    c.CaseType,
                    c.Status,
                    c.Priority,
                    c.AssignedLawyerName,
                    c.OpenDate,
                    c.CloseDate
                })
                .ToListAsync();

            return Ok(cases);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var legalCase = await _dbContext.LegalCases
                .Include(c => c.Opponents)
                .Include(c => c.Stages)
                .Include(c => c.Sessions)
                    .ThenInclude(s => s.SessionNotes)
                .Include(c => c.Sessions)
                    .ThenInclude(s => s.VoiceRecordings)
                .Include(c => c.Notes)
                .Include(c => c.Documents)
                .Include(c => c.VoiceRecordings)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (legalCase == null)
                return NotFound($"Case with ID {id} not found.");

            return Ok(legalCase);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCaseRequest request)
        {
            var legalCase = new LegalCase
            {
                CaseNumber = request.CaseNumber,
                Title = request.Title,
                ClientId = request.ClientId,
                ClientName = request.ClientName,
                CaseType = request.CaseType,
                Status = request.Status,
                Priority = request.Priority,
                CourtInfo = request.CourtInfo,
                AssignedLawyerId = request.AssignedLawyerId,
                AssignedLawyerName = request.AssignedLawyerName,
                Description = request.Description,
                Tags = request.Tags ?? new List<string>(),
                CreatedOn = DateTime.UtcNow
            };

            _dbContext.LegalCases.Add(legalCase);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = legalCase.Id }, legalCase);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCaseRequest request)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            legalCase.Title = request.Title;
            legalCase.Status = request.Status;
            legalCase.Priority = request.Priority;
            legalCase.Description = request.Description;
            legalCase.Tags = request.Tags ?? new List<string>();

            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            _dbContext.LegalCases.Remove(legalCase);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/timeline")]
        public async Task<IActionResult> GetTimeline(Guid id)
        {
            var legalCase = await _dbContext.LegalCases
                .Include(c => c.Stages)
                .Include(c => c.Sessions)
                    .ThenInclude(s => s.SessionNotes)
                .Include(c => c.Notes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (legalCase == null) return NotFound();

            var timelineEvents = new List<object>();

            foreach (var stage in legalCase.Stages)
            {
                timelineEvents.Add(new { Type = "Stage", Date = stage.StartDate, Data = stage });
            }
            foreach (var session in legalCase.Sessions)
            {
                timelineEvents.Add(new { Type = "Session", Date = session.SessionDate, Data = session });
            }
            foreach (var note in legalCase.Notes)
            {
                timelineEvents.Add(new { Type = "Note", Date = note.Date, Data = note });
            }

            // Also add case creation as an event
            timelineEvents.Add(new { Type = "Created", Date = legalCase.CreatedOn, Data = new { Message = "Case Opened" } });

            var sortedTimeline = timelineEvents.OrderByDescending(e => ((dynamic)e).Date).ToList();

            return Ok(sortedTimeline);
        }

        [HttpPost("{id}/notes")]
        public async Task<IActionResult> AddNote(Guid id, [FromBody] AddNoteRequest request)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            if (request.CourtSessionId.HasValue)
            {
                var session = await _dbContext.CourtSessions.FindAsync(request.CourtSessionId.Value);
                if (session == null) return NotFound("Session not found.");
            }

            var note = new CaseNote
            {
                LegalCaseId = id,
                CourtSessionId = request.CourtSessionId,
                NoteText = request.NoteText,
                AuthorName = User.Identity?.Name ?? "Unknown",
                Date = DateTime.UtcNow
            };

            _dbContext.CaseNotes.Add(note);
            await _dbContext.SaveChangesAsync();

            return Ok(note);
        }

        [HttpPost("{id}/documents")]
        public async Task<IActionResult> UploadDocument(Guid id, [FromForm] IFormFile file, [FromQuery] Guid? parentId = null)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            // Versioning logic
            int version = 1;
            Guid? finalParentId = parentId;

            if (finalParentId == null)
            {
                // Check if a document with the same name already exists in this case
                var existingDoc = await _dbContext.CaseDocuments
                    .Where(d => d.LegalCaseId == id && d.FileName == file.FileName && d.ParentDocumentId == null)
                    .OrderByDescending(d => d.Version)
                    .FirstOrDefaultAsync();

                if (existingDoc != null)
                {
                    finalParentId = existingDoc.Id;
                    version = existingDoc.Version + 1;
                }
            }
            else
            {
                var parent = await _dbContext.CaseDocuments.FindAsync(finalParentId);
                if (parent != null)
                {
                    // Find the latest version under this parent
                    var latestVersion = await _dbContext.CaseDocuments
                        .Where(d => d.ParentDocumentId == finalParentId)
                        .OrderByDescending(d => d.Version)
                        .Select(d => d.Version)
                        .FirstOrDefaultAsync();
                    
                    version = Math.Max(parent.Version, latestVersion) + 1;
                }
            }

            var tenantId = _tenantProvider.CurrentTenant?.Id ?? "default";
            var storagePath = $"{tenantId}/cases/{id}/{Guid.NewGuid()}_{file.FileName}";
            using var stream = file.OpenReadStream();
            var fileUrl = await _storageService.UploadFileAsync(stream, storagePath, file.ContentType);

            var document = new CaseDocument
            {
                LegalCaseId = id,
                FileName = file.FileName,
                FileUrl = fileUrl,
                UploadDate = DateTime.UtcNow,
                UploadedBy = User.Identity?.Name ?? "Unknown",
                Version = version,
                ParentDocumentId = finalParentId
            };

            _dbContext.CaseDocuments.Add(document);
            await _dbContext.SaveChangesAsync();

            return Ok(document);
        }

        [HttpGet("documents/{documentId}/versions")]
        public async Task<IActionResult> GetDocumentVersions(Guid documentId)
        {
            // Find the root parent if this is a child version
            var doc = await _dbContext.CaseDocuments.FindAsync(documentId);
            if (doc == null) return NotFound();

            var rootId = doc.ParentDocumentId ?? doc.Id;
            var rootDoc = await _dbContext.CaseDocuments.FindAsync(rootId);

            var versions = await _dbContext.CaseDocuments
                .Where(d => d.Id == rootId || d.ParentDocumentId == rootId)
                .OrderByDescending(d => d.Version)
                .Select(d => new {
                    d.Id,
                    d.FileName,
                    d.FileUrl,
                    d.Version,
                    d.UploadDate,
                    d.UploadedBy
                })
                .ToListAsync();

            return Ok(versions);
        }


        [HttpPost("{id}/stages")]
        public async Task<IActionResult> AddStage(Guid id, [FromBody] AddStageRequest request)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            var stage = new CaseStage
            {
                LegalCaseId = id,
                Name = request.Name,
                StartDate = request.StartDate,
                Notes = request.Notes
            };

            _dbContext.CaseStages.Add(stage);
            await _dbContext.SaveChangesAsync();
            return Ok(stage);
        }
        [HttpPost("{id}/sessions")]
        public async Task<IActionResult> AddSession(Guid id, [FromBody] AddSessionRequest request)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            var session = new CourtSession
            {
                LegalCaseId = id,
                CourtName = request.CourtName,
                RoomNumber = request.RoomNumber,
                JudgeName = request.JudgeName,
                SessionDate = request.SessionDate,
                Notes = request.Notes
            };

            _dbContext.CourtSessions.Add(session);
            await _dbContext.SaveChangesAsync();
            return Ok(session);
        }

        [HttpPost("{id}/parties")]
        public async Task<IActionResult> AddParty(Guid id, [FromBody] AddPartyRequest request)
        {
            var legalCase = await _dbContext.LegalCases.FindAsync(id);
            if (legalCase == null) return NotFound();

            var party = new Opponent
            {
                LegalCaseId = id,
                Name = request.Name,
                LawyerName = request.LawyerName,
                Notes = request.Notes,
                PartyType = request.PartyType
            };

            _dbContext.Opponents.Add(party);
            await _dbContext.SaveChangesAsync();
            return Ok(party);
        }

        [HttpPatch("notes/{noteId}")]
        public async Task<IActionResult> UpdateNote(Guid noteId, [FromBody] AddNoteRequest request)
        {
            var note = await _dbContext.CaseNotes.FindAsync(noteId);
            if (note == null) return NotFound();

            note.NoteText = request.NoteText;
            await _dbContext.SaveChangesAsync();
            return Ok(note);
        }

        [HttpDelete("notes/{noteId}")]
        public async Task<IActionResult> DeleteNote(Guid noteId)
        {
            var note = await _dbContext.CaseNotes.FindAsync(noteId);
            if (note == null) return NotFound();

            _dbContext.CaseNotes.Remove(note);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("sessions/{sessionId}")]
        public async Task<IActionResult> UpdateSession(Guid sessionId, [FromBody] AddSessionRequest request)
        {
            var session = await _dbContext.CourtSessions.FindAsync(sessionId);
            if (session == null) return NotFound();

            session.CourtName = request.CourtName;
            session.RoomNumber = request.RoomNumber;
            session.JudgeName = request.JudgeName;
            session.SessionDate = request.SessionDate;
            session.Notes = request.Notes;

            await _dbContext.SaveChangesAsync();
            return Ok(session);
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<IActionResult> DeleteSession(Guid sessionId)
        {
            var session = await _dbContext.CourtSessions.FindAsync(sessionId);
            if (session == null) return NotFound();

            _dbContext.CourtSessions.Remove(session);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("sessions/{sessionId}/notes")]
        public async Task<IActionResult> GetSessionNotes(Guid sessionId)
        {
            var session = await _dbContext.CourtSessions.FindAsync(sessionId);
            if (session == null) return NotFound();

            var notes = await _dbContext.CaseNotes
                .Where(n => n.CourtSessionId == sessionId)
                .OrderByDescending(n => n.Date)
                .ToListAsync();

            return Ok(notes);
        }

        [HttpPost("sessions/{sessionId}/notes")]
        public async Task<IActionResult> AddSessionNote(Guid sessionId, [FromBody] AddNoteRequest request)
        {
            var session = await _dbContext.CourtSessions.Include(s => s.LegalCase).FirstOrDefaultAsync(s => s.Id == sessionId);
            if (session == null) return NotFound();

            var note = new CaseNote
            {
                LegalCaseId = session.LegalCaseId,
                CourtSessionId = sessionId,
                NoteText = request.NoteText,
                AuthorName = User.Identity?.Name ?? "Unknown",
                Date = DateTime.UtcNow
            };

            _dbContext.CaseNotes.Add(note);
            await _dbContext.SaveChangesAsync();

            return Ok(note);
        }

        [HttpGet("lookup/courts")]
        public async Task<IActionResult> GetCourts()
        {
            var courts = await _dbContext.CourtSessions
                .Select(s => s.CourtName)
                .Distinct()
                .ToListAsync();
            return Ok(courts);
        }

        [HttpGet("lookup/judges")]
        public async Task<IActionResult> GetJudges()
        {
            var judges = await _dbContext.CourtSessions
                .Where(s => !string.IsNullOrEmpty(s.JudgeName))
                .Select(s => s.JudgeName)
                .Distinct()
                .ToListAsync();
            return Ok(judges);
        }
    }


    public class CreateCaseRequest
    {
        [Required] public string CaseNumber { get; set; } = default!;
        [Required] public string Title { get; set; } = default!;
        [Required] public string ClientId { get; set; } = default!;
        [Required] public string ClientName { get; set; } = default!;
        [Required] public string CaseType { get; set; } = default!;
        public CaseStatus Status { get; set; }
        public Priority Priority { get; set; }
        [Required] public string CourtInfo { get; set; } = default!;
        [Required] public string AssignedLawyerId { get; set; } = default!;
        [Required] public string AssignedLawyerName { get; set; } = default!;
        public string? Description { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class UpdateCaseRequest
    {
        [Required] public string Title { get; set; } = default!;
        public CaseStatus Status { get; set; }
        public Priority Priority { get; set; }
        public string? Description { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class AddNoteRequest
    {
        public string NoteText { get; set; } = default!;
        public Guid? CourtSessionId { get; set; }
    }

    public class AddStageRequest
    {
        public string Name { get; set; } = default!;
        public DateTime StartDate { get; set; }
        public string? Notes { get; set; }
    }

    public class AddSessionRequest
    {
        public string CourtName { get; set; } = default!;
        public string? RoomNumber { get; set; }
        public string? JudgeName { get; set; }
        public DateTime SessionDate { get; set; }
        public string? Notes { get; set; }
    }

    public class AddPartyRequest
    {
        public string Name { get; set; } = default!;
        public string? LawyerName { get; set; }
        public string? Notes { get; set; }
        public string PartyType { get; set; } = "Opponent";
    }
}
