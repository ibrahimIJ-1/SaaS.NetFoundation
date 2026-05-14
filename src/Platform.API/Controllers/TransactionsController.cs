using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<TransactionsController> _logger;

        public TransactionsController(ApplicationDbContext db, ILogger<TransactionsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ── GET /api/transactions ───────────────────────────────────────────
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] TransactionStatus? status, [FromQuery] Guid? contactId)
        {
            var query = _db.LegalTransactions
                .Include(t => t.WorkflowDefinition)
                .Include(t => t.Contact)
                .Include(t => t.Steps.OrderBy(s => s.Order))
                .AsQueryable();

            if (status.HasValue) query = query.Where(t => t.Status == status);
            if (contactId.HasValue) query = query.Where(t => t.ContactId == contactId);

            var transactions = await query
                .OrderByDescending(t => t.CreatedOn)
                .Select(t => new
                {
                    t.Id,
                    t.TransactionNumber,
                    t.Status,
                    t.ActualPrice,
                    t.Notes,
                    t.CreatedOn,
                    t.ClientName,
                    WorkflowName = t.WorkflowDefinition.Name,
                    ContactName = t.Contact != null ? t.Contact.FullName : t.ClientName,
                    TotalSteps = t.Steps.Count,
                    CompletedSteps = t.Steps.Count(s => s.Status == StepStatus.Completed),
                    TotalActualExpenses = t.Steps.Sum(s => s.ActualExpense),
                    CurrentStepName = t.Steps.Where(s => s.Status == StepStatus.InProgress || s.Status == StepStatus.Pending)
                        .OrderBy(s => s.Order).Select(s => s.StepName).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(transactions);
        }

        // ── GET /api/transactions/{id} ──────────────────────────────────────
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var transaction = await _db.LegalTransactions
                .Include(t => t.WorkflowDefinition)
                    .ThenInclude(w => w.Steps.OrderBy(s => s.Order))
                .Include(t => t.Contact)
                .Include(t => t.Steps.OrderBy(s => s.Order))
                    .ThenInclude(s => s.StepDefinition)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null) return NotFound();

            return Ok(new
            {
                transaction.Id,
                transaction.TransactionNumber,
                transaction.Status,
                transaction.ActualPrice,
                transaction.Notes,
                transaction.CreatedOn,
                transaction.ClientName,
                transaction.WorkflowDefinitionId,
                WorkflowName = transaction.WorkflowDefinition.Name,
                ContactId = transaction.ContactId,
                ContactName = transaction.Contact != null
                    ? transaction.Contact.FullName
                    : transaction.ClientName,
                TotalActualExpenses = transaction.Steps.Sum(s => s.ActualExpense),
                EstimatedPrice = transaction.WorkflowDefinition.TotalEstimatedPrice,
                EstimatedExpenses = transaction.WorkflowDefinition.TotalEstimatedExpenses,
                Steps = transaction.Steps.Select(s => new
                {
                    s.Id,
                    s.StepName,
                    s.Order,
                    s.Status,
                    s.ActualPrice,
                    s.ActualExpense,
                    s.ExpenseDescription,
                    s.Notes,
                    s.CompletionDate,
                    s.AssignedPersonsJson,
                    s.UploadedFilesJson,
                    EstimatedPrice = s.StepDefinition.EstimatedPrice,
                    EstimatedExpense = s.StepDefinition.EstimatedExpense,
                    RequiredFileNames = s.StepDefinition.RequiredFileNames
                })
            });
        }

        // ── POST /api/transactions ──────────────────────────────────────────
        /// <summary>Starts a new transaction by cloning steps from a workflow template.</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTransactionRequest request)
        {
            var workflow = await _db.WorkflowDefinitions
                .Include(w => w.Steps.OrderBy(s => s.Order))
                .FirstOrDefaultAsync(w => w.Id == request.WorkflowDefinitionId);

            if (workflow == null) return BadRequest(new { message = "Workflow template not found." });

            // Generate unique transaction number
            var year = DateTime.UtcNow.Year;
            var count = await _db.LegalTransactions.CountAsync(t => t.CreatedOn.Year == year);
            var transactionNumber = $"TXN-{year}-{(count + 1):D4}";

            // Resolve contact name
            string clientName = request.ClientName ?? "";
            if (request.ContactId.HasValue && string.IsNullOrWhiteSpace(clientName))
            {
                var contact = await _db.Contacts.FindAsync(request.ContactId.Value);
                if (contact != null) clientName = contact.FullName;
            }

            // Resolve Currency and Rate
            var currencyId = request.CurrencyId ?? workflow.CurrencyId;
            var exchangeRate = 1.0m;
            if (currencyId.HasValue)
            {
                var currency = await _db.Currencies.FindAsync(currencyId.Value);
                if (currency != null) exchangeRate = currency.ExchangeRate;
            }

            var transaction = new LegalTransaction
            {
                TransactionNumber = transactionNumber,
                WorkflowDefinitionId = request.WorkflowDefinitionId,
                ContactId = request.ContactId,
                ClientName = clientName,
                ActualPrice = request.ActualPrice > 0 ? request.ActualPrice : workflow.TotalEstimatedPrice,
                Notes = request.Notes,
                Status = TransactionStatus.Active,
                CreatedOn = DateTime.UtcNow,
                CurrencyId = currencyId,
                ExchangeRate = exchangeRate
            };

            // Clone steps from template
            foreach (var stepDef in workflow.Steps)
            {
                var assigneesJson = JsonSerializer.Serialize(stepDef.DefaultAssigneeContactIds);
                transaction.Steps.Add(new TransactionStepInstance
                {
                    StepDefinitionId = stepDef.Id,
                    StepName = stepDef.Name,
                    Order = stepDef.Order,
                    Status = stepDef.Order == 1 ? StepStatus.InProgress : StepStatus.Pending,
                    ActualPrice = stepDef.EstimatedPrice,
                    ActualExpense = 0,
                    AssignedPersonsJson = assigneesJson,
                    CreatedOn = DateTime.UtcNow,
                    CurrencyId = currencyId,
                    ExchangeRate = exchangeRate
                });
            }

            _db.LegalTransactions.Add(transaction);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Transaction {TransactionNumber} started. First step: {StepName}", transactionNumber, workflow.Steps.FirstOrDefault()?.Name);

            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, new { transaction.Id, transaction.TransactionNumber });
        }

        // ── PATCH /api/transactions/{id}/steps/{stepId} ─────────────────────
        /// <summary>Updates a step's status, financials, or notes.</summary>
        [HttpPatch("{id:guid}/steps/{stepId:guid}")]
        public async Task<IActionResult> UpdateStep(Guid id, Guid stepId, [FromBody] UpdateStepRequest request)
        {
            var transaction = await _db.LegalTransactions
                .Include(t => t.Steps.OrderBy(s => s.Order))
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null) return NotFound(new { message = "Transaction not found." });

            var step = transaction.Steps.FirstOrDefault(s => s.Id == stepId);
            if (step == null) return NotFound(new { message = "Step not found." });

            // Update fields
            if (request.CurrencyId.HasValue)
            {
                step.CurrencyId = request.CurrencyId.Value;
                var currency = await _db.Currencies.FindAsync(request.CurrencyId.Value);
                if (currency != null) step.ExchangeRate = currency.ExchangeRate;
            }

            if (request.Status.HasValue) step.Status = request.Status.Value;
            if (request.ActualPrice.HasValue) step.ActualPrice = request.ActualPrice.Value;
            if (request.ActualExpense.HasValue) step.ActualExpense = request.ActualExpense.Value;
            if (request.ExpenseDescription != null) step.ExpenseDescription = request.ExpenseDescription;
            if (request.Notes != null) step.Notes = request.Notes;

            if (request.Status == StepStatus.Completed && step.CompletionDate == null)
            {
                step.CompletionDate = DateTime.UtcNow;

                // Activate next step
                var nextStep = transaction.Steps.OrderBy(s => s.Order)
                    .FirstOrDefault(s => s.Order > step.Order && s.Status == StepStatus.Pending);

                if (nextStep != null)
                {
                    nextStep.Status = StepStatus.InProgress;
                    _logger.LogInformation("Step {StepName} is now active for transaction {TransactionNumber}", nextStep.StepName, transaction.TransactionNumber);
                }
                else
                {
                    // All steps done
                    var allCompleted = transaction.Steps.All(s => s.Status == StepStatus.Completed);
                    if (allCompleted) transaction.Status = TransactionStatus.Completed;
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Step updated successfully." });
        }

        // ── POST /api/transactions/{id}/steps/{stepId}/files ────────────────
        [HttpPost("{id:guid}/steps/{stepId:guid}/files")]
        public async Task<IActionResult> UploadFile(Guid id, Guid stepId, [FromForm] IFormFile file)
        {
            var transaction = await _db.LegalTransactions.Include(t => t.Steps).FirstOrDefaultAsync(t => t.Id == id);
            if (transaction == null) return NotFound();

            var step = transaction.Steps.FirstOrDefault(s => s.Id == stepId);
            if (step == null) return NotFound();

            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            // In a real app, save to disk/cloud. Here we'll mock the URL.
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var mockUrl = $"/uploads/transactions/{fileName}";

            var currentFiles = string.IsNullOrEmpty(step.UploadedFilesJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(step.UploadedFilesJson) ?? new List<string>();

            currentFiles.Add(file.FileName); // In real app, store the URL
            step.UploadedFilesJson = JsonSerializer.Serialize(currentFiles);

            await _db.SaveChangesAsync();
            return Ok(new { url = mockUrl, fileName = file.FileName });
        }

        [HttpDelete("{id:guid}/steps/{stepId:guid}/files")]
        public async Task<IActionResult> DeleteFile(Guid id, Guid stepId, [FromQuery] string fileName)
        {
            var transaction = await _db.LegalTransactions.Include(t => t.Steps).FirstOrDefaultAsync(t => t.Id == id);
            if (transaction == null) return NotFound();

            var step = transaction.Steps.FirstOrDefault(s => s.Id == stepId);
            if (step == null) return NotFound();

            if (string.IsNullOrEmpty(step.UploadedFilesJson)) return Ok();

            var currentFiles = JsonSerializer.Deserialize<List<string>>(step.UploadedFilesJson) ?? new List<string>();
            currentFiles.Remove(fileName);
            step.UploadedFilesJson = JsonSerializer.Serialize(currentFiles);

            await _db.SaveChangesAsync();
            return Ok();
        }

        // ── PATCH /api/transactions/{id}/cancel ─────────────────────────────
        [HttpPatch("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var transaction = await _db.LegalTransactions.FindAsync(id);
            if (transaction == null) return NotFound();

            transaction.Status = TransactionStatus.Cancelled;
            await _db.SaveChangesAsync();
            return Ok(new { message = "Transaction cancelled." });
        }

        // ── GET /api/transactions/stats ─────────────────────────────────────
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var active = await _db.LegalTransactions.CountAsync(t => t.Status == TransactionStatus.Active);
            var completed = await _db.LegalTransactions.CountAsync(t => t.Status == TransactionStatus.Completed);
            
            // Normalize values to base currency (using the snapshot exchange rate of each transaction/step)
            var transactions = await _db.LegalTransactions.ToListAsync();
            var steps = await _db.TransactionStepInstances.ToListAsync();

            var totalRevenueBase = transactions.Sum(t => t.ActualPrice * t.ExchangeRate);
            var totalExpensesBase = steps.Sum(s => s.ActualExpense * s.ExchangeRate);

            return Ok(new
            {
                Active = active,
                Completed = completed,
                TotalRevenue = totalRevenueBase,
                TotalExpenses = totalExpensesBase,
                NetProfit = totalRevenueBase - totalExpensesBase
            });
        }

        // ── Request Models ──────────────────────────────────────────────────────
        public class CreateTransactionRequest
        {
            public Guid WorkflowDefinitionId { get; set; }
            public Guid? ContactId { get; set; }
            public string? ClientName { get; set; }
            public decimal ActualPrice { get; set; }
            public string? Notes { get; set; }
            public Guid? CurrencyId { get; set; }
        }

        public class UpdateStepRequest
        {
            public StepStatus? Status { get; set; }
            public decimal? ActualPrice { get; set; }
            public decimal? ActualExpense { get; set; }
            public string? ExpenseDescription { get; set; }
            public string? Notes { get; set; }
            public Guid? CurrencyId { get; set; }
        }
    }
}

