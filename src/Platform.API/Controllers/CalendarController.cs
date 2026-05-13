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
    [ApiController]
    [Route("api/[controller]")]
    public class CalendarController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CalendarController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<CalendarEvent>>> GetEvents(DateTime start, DateTime end)
        {
            var sessions = await _context.CourtSessions
                .Include(s => s.LegalCase)
                .Where(s => s.SessionDate >= start && s.SessionDate <= end)
                .Select(s => new CalendarEvent
                {
                    Id = s.Id.ToString(),
                    Title = $"جلسة: {s.LegalCase.Title}",
                    Start = s.SessionDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    End = s.SessionDate.AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss"),
                    Description = s.Notes,
                    Type = "Session",

                    LegalCaseId = s.LegalCaseId.ToString(),
                    IsAllDay = false
                })
                .ToListAsync();

            var tasks = await _context.LegalTasks
                .Include(t => t.LegalCase)
                .Where(t => t.DueDate >= start && t.DueDate <= end)
                .Select(t => new CalendarEvent
                {
                    Id = t.Id.ToString(),
                    Title = $"مهمة: {t.Title}",
                    Start = t.DueDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    End = t.DueDate.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Description = t.Description,
                    Type = "Deadline",
                    LegalCaseId = t.LegalCaseId.ToString(),
                    IsAllDay = true
                })
                .ToListAsync();

            return sessions.Concat(tasks).ToList();
        }

        [HttpGet("tasks")]
        public async Task<ActionResult<IEnumerable<LegalTask>>> GetTasks()
        {
            return await _context.LegalTasks
                .Include(t => t.LegalCase)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        [HttpPatch("tasks/{id}/toggle")]
        public async Task<IActionResult> ToggleTask(Guid id, [FromBody] TaskToggleRequest request)
        {
            var task = await _context.LegalTasks.FindAsync(id);
            if (task == null) return NotFound();

            task.IsCompleted = request.IsCompleted;
            await _context.SaveChangesAsync();

            return Ok(task);
        }
    }

    public class CalendarEvent
    {
        public string Id { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string Start { get; set; } = default!;
        public string End { get; set; } = default!;
        public string? Description { get; set; }
        public string Type { get; set; } = default!;
        public string? LegalCaseId { get; set; }
        public bool IsAllDay { get; set; }
        public bool HasConflict { get; set; }
    }

    public class TaskToggleRequest
    {
        public bool IsCompleted { get; set; }
    }
}
