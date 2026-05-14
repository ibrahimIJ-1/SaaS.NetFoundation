using Platform.Application.DTOs.Accounting;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Platform.Application.Services
{
    public interface IExpenseService
    {
        Task<List<ExpenseDto>> GetAllAsync();
        Task<List<ExpenseDto>> GetByCaseAsync(Guid caseId);
        Task<ExpenseDto> CreateAsync(CreateExpenseRequestDto request);
        Task DeleteAsync(Guid id);
    }
}
