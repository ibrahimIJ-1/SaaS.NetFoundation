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
    [Route("api/knowledge")]
    public class KnowledgeController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public KnowledgeController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] LegalArea? area)
        {
            var query = _dbContext.KnowledgeArticles.AsQueryable();
            
            if (area.HasValue)
            {
                query = query.Where(a => a.Area == area.Value);
            }

            var articles = await query
                .OrderByDescending(a => a.CreatedOn)
                .ToListAsync();

            return Ok(articles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var article = await _dbContext.KnowledgeArticles.FindAsync(id);
            if (article == null) return NotFound();
            return Ok(article);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] KnowledgeArticle article)
        {
            article.AuthorName = User.Identity?.Name ?? "Lawyer";
            _dbContext.KnowledgeArticles.Add(article);
            await _dbContext.SaveChangesAsync();
            return Ok(article);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] KnowledgeArticle request)
        {
            var article = await _dbContext.KnowledgeArticles.FindAsync(id);
            if (article == null) return NotFound();

            article.Title = request.Title;
            article.Content = request.Content;
            article.Area = request.Area;
            article.Tags = request.Tags;
            article.IsFirmWide = request.IsFirmWide;

            await _dbContext.SaveChangesAsync();
            return Ok(article);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var article = await _dbContext.KnowledgeArticles.FindAsync(id);
            if (article == null) return NotFound();

            _dbContext.KnowledgeArticles.Remove(article);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
