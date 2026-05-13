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
    [Route("api/currencies")]
    public class CurrenciesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public CurrenciesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var currencies = await _db.Currencies.OrderByDescending(c => c.IsBase).ToListAsync();
            
            // Seed if empty
            if (!currencies.Any())
            {
                var iqd = new Currency { Code = "IQD", Name = "دينار عراقي", Symbol = "د.ع", ExchangeRate = 1.0m, IsBase = true };
                var usd = new Currency { Code = "USD", Name = "دولار أمريكي", Symbol = "$", ExchangeRate = 1500.0m, IsBase = false };
                _db.Currencies.AddRange(iqd, usd);
                await _db.SaveChangesAsync();
                currencies = await _db.Currencies.OrderByDescending(c => c.IsBase).ToListAsync();
            }
            
            return Ok(currencies);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Currency currency)
        {
            if (currency.IsBase)
            {
                var currentBase = await _db.Currencies.FirstOrDefaultAsync(c => c.IsBase);
                if (currentBase != null) currentBase.IsBase = false;
            }
            _db.Currencies.Add(currency);
            await _db.SaveChangesAsync();
            return Ok(currency);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, Currency currency)
        {
            var existing = await _db.Currencies.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Code = currency.Code;
            existing.Name = currency.Name;
            existing.Symbol = currency.Symbol;
            existing.ExchangeRate = currency.ExchangeRate;
            
            if (currency.IsBase && !existing.IsBase)
            {
                var currentBase = await _db.Currencies.FirstOrDefaultAsync(c => c.IsBase);
                if (currentBase != null) currentBase.IsBase = false;
                existing.IsBase = true;
            }

            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currency = await _db.Currencies.FindAsync(id);
            if (currency == null) return NotFound();
            if (currency.IsBase) return BadRequest("Cannot delete the base currency.");

            _db.Currencies.Remove(currency);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
