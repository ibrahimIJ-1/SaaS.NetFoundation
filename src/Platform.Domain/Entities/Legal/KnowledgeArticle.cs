using Platform.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Platform.Domain.Entities.Legal
{
    public enum LegalArea { Criminal, Civil, Corporate, Family, Labor, IntellectualProperty, Administrative, Other }

    public class KnowledgeArticle : AuditableEntity
    {
        [Required]
        public string Title { get; set; } = default!;

        [Required]
        public string Content { get; set; } = default!; // Supports Markdown/HTML

        public LegalArea Area { get; set; } = LegalArea.Other;

        public string? AuthorName { get; set; }
        
        public bool IsFirmWide { get; set; } = true;

        public List<string> Tags { get; set; } = new List<string>();
        
        public string? DocumentUrl { get; set; } // Optional linked file/template
    }
}
