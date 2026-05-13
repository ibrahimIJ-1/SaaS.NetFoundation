using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/tasks")]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public TasksController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _dbContext.LegalTasks
                .OrderBy(t => t.DueDate)
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _dbContext.LegalTasks.FindAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
        {
            var task = new LegalTask
            {
                Title = request.Title,
                Description = request.Description,
                DueDate = request.DueDate,
                AssigneeId = request.AssigneeId,
                AssigneeName = request.AssigneeName,
                LegalCaseId = request.LegalCaseId,
                Priority = request.Priority,
                Type = request.Type,
                IsCompleted = false
            };

            _dbContext.LegalTasks.Add(task);
            await _dbContext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request)
        {
            var task = await _dbContext.LegalTasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Title = request.Title;
            task.Description = request.Description;
            task.DueDate = request.DueDate;
            task.Priority = request.Priority;
            task.Type = request.Type;
            task.IsCompleted = request.IsCompleted;
            
            if (request.AssigneeId != null)
            {
                task.AssigneeId = request.AssigneeId;
                task.AssigneeName = request.AssigneeName;
            }

            await _dbContext.SaveChangesAsync();
            return Ok(task);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> ToggleComplete(Guid id, [FromBody] ToggleTaskCompleteRequest request)
        {
            var task = await _dbContext.LegalTasks.FindAsync(id);
            if (task == null) return NotFound();

            task.IsCompleted = request.IsCompleted;
            await _dbContext.SaveChangesAsync();

            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var task = await _dbContext.LegalTasks.FindAsync(id);
            if (task == null) return NotFound();

            _dbContext.LegalTasks.Remove(task);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateTaskRequest
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public string? AssigneeId { get; set; }
        public string? AssigneeName { get; set; }
        public Guid? LegalCaseId { get; set; }
        public Priority Priority { get; set; }
        public TaskType Type { get; set; }
    }

    public class UpdateTaskRequest
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public string? AssigneeId { get; set; }
        public string? AssigneeName { get; set; }
        public Priority Priority { get; set; }
        public TaskType Type { get; set; }
        public bool IsCompleted { get; set; }
    }

    public class ToggleTaskCompleteRequest
    {
        public bool IsCompleted { get; set; }
    }
}
