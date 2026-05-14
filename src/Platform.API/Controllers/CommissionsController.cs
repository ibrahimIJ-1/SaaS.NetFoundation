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
    [Route("api/commissions")]
    public class CommissionsController : ControllerBase
    {
        private readonly ICommissionService _commissionService;

        public CommissionsController(ICommissionService commissionService)
        {
            _commissionService = commissionService;
        }

        [HttpGet("rules")]
        public async Task<ActionResult<List<CommissionRuleDto>>> GetRules()
        {
            return Ok(await _commissionService.GetRulesAsync());
        }

        [HttpPost("rules")]
        public async Task<ActionResult<CommissionRuleDto>> CreateRule([FromBody] CreateCommissionRuleDto request)
        {
            return Ok(await _commissionService.CreateRuleAsync(request));
        }

        [HttpGet("calculate/{lawyerId}")]
        public async Task<ActionResult<CommissionSummaryDto>> CalculateCommission(string lawyerId)
        {
            try
            {
                return Ok(await _commissionService.CalculateAsync(lawyerId));
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
