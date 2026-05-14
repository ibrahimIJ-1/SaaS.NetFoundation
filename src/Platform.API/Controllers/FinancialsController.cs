using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Platform.Application.DTOs.Accounting;
using Platform.Application.Services;
using System;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/financials")]
    public class FinancialsController : ControllerBase
    {
        private readonly ITrustService _trustService;
        private readonly IFinancialReportService _reportService;

        public FinancialsController(ITrustService trustService, IFinancialReportService reportService)
        {
            _trustService = trustService;
            _reportService = reportService;
        }

        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            return Ok(await _reportService.GetDashboardStatsAsync());
        }

        [HttpGet("trust/case/{caseId}")]
        public async Task<ActionResult<TrustTransactionsResponseDto>> GetTrustTransactions(Guid caseId)
        {
            return Ok(await _trustService.GetByCaseAsync(caseId));
        }

        [HttpPost("trust")]
        public async Task<ActionResult<TrustTransactionDto>> RecordTrustTransaction([FromBody] RecordTrustRequestDto request)
        {
            return Ok(await _trustService.RecordTransactionAsync(request));
        }

        [HttpGet("trust")]
        public async Task<ActionResult<List<TrustTransactionDto>>> GetAllTrustTransactions()
        {
            return Ok(await _trustService.GetAllAsync());
        }
    }
}
