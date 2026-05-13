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
    [Route("api/expenses")]
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ExpensesController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var expenses = await _dbContext.Expenses
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
            return Ok(expenses);
        }

        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetByCase(Guid caseId)
        {
            var expenses = await _dbContext.Expenses
                .Where(e => e.LegalCaseId == caseId)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
            return Ok(expenses);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Expense expense)
        {
            _dbContext.Expenses.Add(expense);
            await _dbContext.SaveChangesAsync();
            return Ok(expense);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var expense = await _dbContext.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            _dbContext.Expenses.Remove(expense);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
