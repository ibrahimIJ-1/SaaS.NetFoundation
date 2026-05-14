using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Abstractions;
using Platform.Application.Common.Interfaces;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Platform.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/documents")]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStorageService _storageService;
        private readonly IOCRService _ocrService;
        private readonly IDocumentConversionService _conversionService;

        public DocumentsController(
            ApplicationDbContext dbContext,
            IStorageService storageService,
            IOCRService ocrService,
            IDocumentConversionService conversionService)
        {
            _dbContext = dbContext;
            _storageService = storageService;
            _ocrService = ocrService;
            _conversionService = conversionService;
        }

        [HttpGet("shared")]
        public async Task<IActionResult> GetSharedDocuments()
        {
            var contactIdStr = User.FindFirstValue("contactId");
            if (string.IsNullOrEmpty(contactIdStr) || !Guid.TryParse(contactIdStr, out var contactId))
                return BadRequest("Unauthorized contact access");

            var documents = await _dbContext.CaseDocuments
                .Include(d => d.LegalCase)
                .Where(d => d.LegalCase.ContactId == contactId && d.IsSharedWithClient)
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var documents = await _dbContext.CaseDocuments
                .Include(d => d.LegalCase)
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("case/{caseId}")]
        public async Task<IActionResult> GetByCase(Guid caseId)
        {
            var query = _dbContext.CaseDocuments.Include(d => d.LegalCase).AsQueryable();

            // Filter for Client Portal
            var contactIdStr = User.FindFirstValue("contactId");
            if (!string.IsNullOrEmpty(contactIdStr) && Guid.TryParse(contactIdStr, out var contactId))
            {
                // Ensure the client owns this case AND the document is explicitly shared
                query = query.Where(d => d.LegalCaseId == caseId && d.LegalCase.ContactId == contactId && d.IsSharedWithClient);
            }
            else
            {
                query = query.Where(d => d.LegalCaseId == caseId);
            }

            var documents = await query
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var document = await _dbContext.CaseDocuments
                .Include(d => d.Highlights)
                .Include(d => d.Annotations)
                .Include(d => d.VideoAnnotations)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null) return NotFound();
            return Ok(document);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] Guid caseId, IFormFile file, [FromQuery] Guid? parentId = null)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded");

            // Versioning logic
            int version = 1;
            Guid? finalParentId = parentId;

            if (finalParentId == null)
            {
                var existingDoc = await _dbContext.CaseDocuments
                    .Where(d => d.LegalCaseId == caseId && d.FileName == file.FileName && d.ParentDocumentId == null)
                    .OrderByDescending(d => d.Version)
                    .FirstOrDefaultAsync();

                if (existingDoc != null)
                {
                    finalParentId = existingDoc.Id;
                    version = existingDoc.Version + 1;
                }
            }
            else
            {
                var parent = await _dbContext.CaseDocuments.FindAsync(finalParentId);
                if (parent != null)
                {
                    var latestVersion = await _dbContext.CaseDocuments
                        .Where(d => d.ParentDocumentId == finalParentId)
                        .OrderByDescending(d => d.Version)
                        .Select(d => d.Version)
                        .FirstOrDefaultAsync();

                    version = Math.Max(parent.Version, latestVersion) + 1;
                }
            }

            var contentType = file.ContentType;
            if (string.IsNullOrEmpty(contentType) || contentType == "application/octet-stream")
            {
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                contentType = ext switch
                {
                    ".pdf" => "application/pdf",
                    ".doc" => "application/msword",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".xls" => "application/vnd.ms-excel",
                    ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    ".ppt" => "application/vnd.ms-powerpoint",
                    ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".webp" => "image/webp",
                    ".bmp" => "image/bmp",
                    ".mp4" => "video/mp4",
                    ".webm" => "video/webm",
                    ".mov" => "video/quicktime",
                    ".avi" => "video/x-msvideo",
                    ".rtf" => "application/rtf",
                    ".txt" => "text/plain",
                    _ => contentType
                };
            }

            using var uploadStream = new MemoryStream();
            await file.CopyToAsync(uploadStream);
            uploadStream.Position = 0;

            var storageFileName = $"{caseId}/{Guid.NewGuid()}_{file.FileName}";
            var originalUrl = await _storageService.UploadFileAsync(uploadStream, storageFileName, contentType);

            string? convertedPdfUrl = null;

            // Auto-convert Office documents to PDF
            if (_conversionService.CanConvert(contentType))
            {
                try
                {
                    uploadStream.Position = 0;
                    using var pdfStream = await _conversionService.ConvertToPdfAsync(uploadStream, file.FileName);
                    var pdfFileName = $"{caseId}/{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}.pdf";
                    convertedPdfUrl = await _storageService.UploadFileAsync(pdfStream, pdfFileName, "application/pdf");
                }
                catch (Exception ex)
                {
                    // Log but don't fail — PDF viewing will be unavailable for this file
                    var logger = HttpContext.RequestServices.GetRequiredService<ILogger<DocumentsController>>();
                    logger.LogWarning(ex, "Failed to convert document to PDF: {FileName}", file.FileName);
                }
            }

            // OCR text extraction
            uploadStream.Position = 0;
            string? extractedText = null;
            try
            {
                extractedText = await _ocrService.ExtractTextAsync(uploadStream, file.FileName);
            }
            catch { /* OCR failure is non-critical */ }

            var document = new CaseDocument
            {
                LegalCaseId = caseId,
                FileName = file.FileName,
                FileUrl = originalUrl,
                ContentType = contentType,
                ConvertedPdfUrl = convertedPdfUrl,
                UploadDate = DateTime.UtcNow,
                UploadedBy = User.Identity?.Name ?? "Unknown",
                ExtractedText = extractedText,
                Version = version,
                ParentDocumentId = finalParentId
            };

            _dbContext.CaseDocuments.Add(document);
            await _dbContext.SaveChangesAsync();

            return Ok(document);
        }

        [HttpGet("{documentId}/versions")]
        public async Task<IActionResult> GetVersions(Guid documentId)
        {
            var doc = await _dbContext.CaseDocuments.FindAsync(documentId);
            if (doc == null) return NotFound();

            var rootId = doc.ParentDocumentId ?? doc.Id;
            var versions = await _dbContext.CaseDocuments
                .Where(d => d.Id == rootId || d.ParentDocumentId == rootId)
                .OrderByDescending(d => d.Version)
                .ToListAsync();

            return Ok(versions);
        }

        [HttpPost("{documentId}/promote")]
        public async Task<IActionResult> PromoteVersion(Guid documentId)
        {
            var selectedVersion = await _dbContext.CaseDocuments.FindAsync(documentId);
            if (selectedVersion == null) return NotFound();
            if (selectedVersion.ParentDocumentId == null) return BadRequest("Already current version");

            var parentId = selectedVersion.ParentDocumentId.Value;
            var currentParent = await _dbContext.CaseDocuments.FindAsync(parentId);
            if (currentParent == null) return NotFound();

            // Promotion logic:
            // 1. Save parent metadata
            var oldParentUrl = currentParent.FileUrl;
            var oldParentVersion = currentParent.Version;
            var oldParentDate = currentParent.UploadDate;
            var oldParentBy = currentParent.UploadedBy;

            // 2. Update parent with selected version's data
            currentParent.FileUrl = selectedVersion.FileUrl;
            currentParent.Version = selectedVersion.Version;
            currentParent.UploadDate = selectedVersion.UploadDate;
            currentParent.UploadedBy = selectedVersion.UploadedBy;

            // 3. Update selected version with old parent's data (moving it to history)
            selectedVersion.FileUrl = oldParentUrl;
            selectedVersion.Version = oldParentVersion;
            selectedVersion.UploadDate = oldParentDate;
            selectedVersion.UploadedBy = oldParentBy;

            await _dbContext.SaveChangesAsync();

            return Ok(currentParent);
        }



        // --- Workspace Features ---

        [HttpPost("{id}/highlights")]
        public async Task<IActionResult> SaveHighlight(Guid id, [FromBody] DocumentHighlight request)
        {
            // Temporary fix for missing columns until migrations are sorted
            try {
                await _dbContext.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[DocumentHighlights]') AND name = 'RectsJson') ALTER TABLE DocumentHighlights ADD RectsJson NVARCHAR(MAX) NULL;");
                await _dbContext.Database.ExecuteSqlRawAsync("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[DocumentHighlights]') AND name = 'Comment') ALTER TABLE DocumentHighlights ADD Comment NVARCHAR(MAX) NULL;");
            } catch { }


            request.DocumentId = id;
            // Removed manual Id setting as it's protected set in BaseEntity
            
            _dbContext.DocumentHighlights.Add(request);
            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }

        [HttpPatch("highlights/{highlightId}")]
        public async Task<IActionResult> UpdateHighlight(Guid highlightId, [FromBody] DocumentHighlight request)
        {
            var highlight = await _dbContext.DocumentHighlights.FindAsync(highlightId);
            if (highlight == null) return NotFound();

            highlight.Comment = request.Comment;
            highlight.Color = request.Color;
            highlight.Label = request.Label;
            
            await _dbContext.SaveChangesAsync();
            return Ok(highlight);
        }



        [HttpDelete("highlights/{highlightId}")]
        public async Task<IActionResult> DeleteHighlight(Guid highlightId)
        {
            var highlight = await _dbContext.DocumentHighlights.FindAsync(highlightId);
            if (highlight == null) return NotFound();

            _dbContext.DocumentHighlights.Remove(highlight);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/annotations")]
        public async Task<IActionResult> SaveAnnotation(Guid id, [FromBody] DocumentAnnotation request)
        {
            request.DocumentId = id;
            request.AuthorName = User.Identity?.Name ?? "Lawyer";
            
            _dbContext.DocumentAnnotations.Add(request);
            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }

        [HttpDelete("annotations/{annotationId}")]
        public async Task<IActionResult> DeleteAnnotation(Guid annotationId)
        {
            var annotation = await _dbContext.DocumentAnnotations.FindAsync(annotationId);
            if (annotation == null) return NotFound();

            _dbContext.DocumentAnnotations.Remove(annotation);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id}/share")]
        public async Task<IActionResult> ToggleSharing(Guid id, [FromBody] bool isShared)
        {
            var document = await _dbContext.CaseDocuments.FindAsync(id);
            if (document == null) return NotFound();

            document.IsSharedWithClient = isShared;
            await _dbContext.SaveChangesAsync();

            return Ok(document);
        }

        [HttpPost("{id}/sign")]
        public async Task<IActionResult> Sign(Guid id, [FromBody] SignDocumentRequest request)
        {
            var document = await _dbContext.CaseDocuments.FindAsync(id);
            if (document == null) return NotFound();

            var signature = new DocumentSignature
            {
                DocumentId = id,
                SignedByUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Client",
                SignerName = request.SignerName,
                SignatureImageUrl = request.SignatureImage,
                SignatureHash = Guid.NewGuid().ToString(), // Simplified hash for this phase
                IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            };

            _dbContext.DocumentSignatures.Add(signature);
            document.IsSigned = true;
            
            await _dbContext.SaveChangesAsync();

            return Ok(signature);
        }

        // --- Video Annotations ---

        [HttpPost("{id}/video-annotations")]
        public async Task<IActionResult> SaveVideoAnnotation(Guid id, [FromBody] DocumentVideoAnnotation request)
        {
            request.DocumentId = id;

            _dbContext.DocumentVideoAnnotations.Add(request);
            await _dbContext.SaveChangesAsync();

            return Ok(request);
        }

        [HttpPatch("video-annotations/{annotationId}")]
        public async Task<IActionResult> UpdateVideoAnnotation(Guid annotationId, [FromBody] DocumentVideoAnnotation request)
        {
            var annotation = await _dbContext.DocumentVideoAnnotations.FindAsync(annotationId);
            if (annotation == null) return NotFound();

            annotation.Comment = request.Comment;
            annotation.Color = request.Color;
            annotation.Label = request.Label;
            annotation.TimeStart = request.TimeStart;
            annotation.TimeEnd = request.TimeEnd;

            await _dbContext.SaveChangesAsync();
            return Ok(annotation);
        }

        [HttpDelete("video-annotations/{annotationId}")]
        public async Task<IActionResult> DeleteVideoAnnotation(Guid annotationId)
        {
            var annotation = await _dbContext.DocumentVideoAnnotations.FindAsync(annotationId);
            if (annotation == null) return NotFound();

            _dbContext.DocumentVideoAnnotations.Remove(annotation);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }

    public class SignDocumentRequest
    {
        public string SignerName { get; set; } = default!;
        public string SignatureImage { get; set; } = default!;
    }
}
