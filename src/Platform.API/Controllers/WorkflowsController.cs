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
    [Route("api/workflows")]
    public class WorkflowsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public WorkflowsController(ApplicationDbContext db) => _db = db;

        // ── GET /api/workflows ──────────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var workflows = await _db.WorkflowDefinitions
                .Include(w => w.Steps.OrderBy(s => s.Order))
                .OrderByDescending(w => w.CreatedOn)
                .ToListAsync();

            return Ok(workflows);
        }

        // ── GET /api/workflows/{id} ─────────────────────────────────────────
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var workflow = await _db.WorkflowDefinitions
                .Include(w => w.Steps.OrderBy(s => s.Order))
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workflow == null) return NotFound();
            return Ok(workflow);
        }

        // ── POST /api/workflows ─────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWorkflowRequest request)
        {
            var workflow = new WorkflowDefinition
            {
                Name = request.Name,
                Description = request.Description,
                TotalEstimatedPrice = request.TotalEstimatedPrice,
                TotalEstimatedExpenses = request.TotalEstimatedExpenses,
                CreatedOn = DateTime.UtcNow
            };

            int order = 1;
            foreach (var stepReq in request.Steps)
            {
                workflow.Steps.Add(new WorkflowStepDefinition
                {
                    Name = stepReq.Name,
                    Description = stepReq.Description,
                    EstimatedPrice = stepReq.EstimatedPrice,
                    EstimatedExpense = stepReq.EstimatedExpense,
                    Order = order++,
                    RequiredFileNames = stepReq.RequiredFileNames ?? new List<string>(),
                    DefaultAssigneeContactIds = stepReq.DefaultAssigneeContactIds ?? new List<string>(),
                    CreatedOn = DateTime.UtcNow
                });
            }

            _db.WorkflowDefinitions.Add(workflow);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = workflow.Id }, workflow);
        }

        // ── PUT /api/workflows/{id} ─────────────────────────────────────────
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateWorkflowRequest request)
        {
            var workflow = await _db.WorkflowDefinitions
                .Include(w => w.Steps)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (workflow == null) return NotFound();

            workflow.Name = request.Name;
            workflow.Description = request.Description;
            workflow.TotalEstimatedPrice = request.TotalEstimatedPrice;
            workflow.TotalEstimatedExpenses = request.TotalEstimatedExpenses;
            workflow.LastModifiedOn = DateTime.UtcNow;

            // Replace steps entirely
            _db.WorkflowStepDefinitions.RemoveRange(workflow.Steps);
            workflow.Steps.Clear();

            int order = 1;
            foreach (var stepReq in request.Steps)
            {
                workflow.Steps.Add(new WorkflowStepDefinition
                {
                    WorkflowDefinitionId = workflow.Id,
                    Name = stepReq.Name,
                    Description = stepReq.Description,
                    EstimatedPrice = stepReq.EstimatedPrice,
                    EstimatedExpense = stepReq.EstimatedExpense,
                    Order = order++,
                    RequiredFileNames = stepReq.RequiredFileNames ?? new List<string>(),
                    DefaultAssigneeContactIds = stepReq.DefaultAssigneeContactIds ?? new List<string>(),
                    CreatedOn = DateTime.UtcNow
                });
            }

            await _db.SaveChangesAsync();
            return Ok(workflow);
        }

        // ── DELETE /api/workflows/{id} ──────────────────────────────────────
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var workflow = await _db.WorkflowDefinitions.FindAsync(id);
            if (workflow == null) return NotFound();

            _db.WorkflowDefinitions.Remove(workflow);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    // ── Request Models ──────────────────────────────────────────────────────
    public class CreateWorkflowRequest
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public decimal TotalEstimatedPrice { get; set; }
        public decimal TotalEstimatedExpenses { get; set; }
        public List<CreateWorkflowStepRequest> Steps { get; set; } = new();
    }

    public class CreateWorkflowStepRequest
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public decimal EstimatedPrice { get; set; }
        public decimal EstimatedExpense { get; set; }
        public List<string>? RequiredFileNames { get; set; }
        public List<string>? DefaultAssigneeContactIds { get; set; }
    }
}
