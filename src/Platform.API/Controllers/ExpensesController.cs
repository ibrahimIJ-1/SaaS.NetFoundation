using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.DTOs.Accounting;
using Platform.Application.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/expenses")]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpensesController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ExpenseDto>>> GetAll()
        {
            return Ok(await _expenseService.GetAllAsync());
        }

        [HttpGet("case/{caseId}")]
        public async Task<ActionResult<List<ExpenseDto>>> GetByCase(Guid caseId)
        {
            return Ok(await _expenseService.GetByCaseAsync(caseId));
        }

        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> Create([FromBody] CreateExpenseRequestDto request)
        {
            return Ok(await _expenseService.CreateAsync(request));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _expenseService.DeleteAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException)
            {
                return NotFound();
            }
        }
    }
}
