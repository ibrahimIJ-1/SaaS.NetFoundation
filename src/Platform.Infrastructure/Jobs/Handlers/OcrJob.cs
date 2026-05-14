using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Hangfire.Server;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Platform.Application.Abstractions;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;

namespace Platform.Infrastructure.Jobs.Handlers
{
    public class OcrJob
    {
        private readonly IServiceProvider _sp;
        private readonly ILogger<OcrJob> _logger;

        public OcrJob(IServiceProvider sp, ILogger<OcrJob> logger)
        {
            _sp = sp;
            _logger = logger;
        }

        public async Task Execute(Guid documentId, string connectionString, PerformContext? context = null)
        {
            // Create a tenant-specific DbContext using the connection string
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(connectionString);
            using var db = new ApplicationDbContext(optionsBuilder.Options);

            using var scope = _sp.CreateScope();
            var scopedProvider = scope.ServiceProvider;
            var storageService = scopedProvider.GetRequiredService<IStorageService>();
            var ocrService = scopedProvider.GetRequiredService<IDocumentOcrService>();
            var httpClientFactory = scopedProvider.GetRequiredService<IHttpClientFactory>();

            var document = await db.CaseDocuments.FindAsync(documentId);
            if (document == null)
            {
                _logger.LogWarning("OCR document {DocumentId} not found", documentId);
                return;
            }

            var rootId = document.ParentDocumentId ?? document.Id;
            var root = await db.CaseDocuments.FindAsync(rootId);
            if (root == null)
            {
                _logger.LogWarning("OCR root document {RootId} not found", rootId);
                return;
            }

            // Download original file
            using var httpClient = httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromMinutes(5);
            using var originalStream = await httpClient.GetStreamAsync(root.FileUrl);

            // Run OCR
            using var ocrPdfStream = await ocrService.OcrToSearchablePdfAsync(originalStream, root.FileName);

            // Upload OCR result PDF
            var ocrKey = $"{root.LegalCaseId}/{Guid.NewGuid()}_ocr_{Path.GetFileNameWithoutExtension(root.FileName)}.pdf";
            var ocrPdfUrl = await storageService.UploadFileAsync(ocrPdfStream, ocrKey, "application/pdf");

            // Versioning: save old root as history, promote OCR result
            var latestVersion = await db.CaseDocuments
                .Where(d => d.ParentDocumentId == rootId || d.Id == rootId)
                .MaxAsync(d => (int?)d.Version) ?? 1;

            var newVersion = latestVersion + 1;

            var historyEntry = new CaseDocument
            {
                LegalCaseId = root.LegalCaseId,
                FileName = root.FileName,
                FileUrl = root.FileUrl,
                ContentType = root.ContentType,
                ConvertedPdfUrl = root.ConvertedPdfUrl,
                UploadDate = root.UploadDate,
                UploadedBy = root.UploadedBy,
                ExtractedText = root.ExtractedText,
                Version = newVersion,
                ParentDocumentId = rootId,
                IsSharedWithClient = root.IsSharedWithClient,
                NeedsSignature = root.NeedsSignature,
                IsSigned = root.IsSigned,
                OcrStatus = null,
            };

            root.FileUrl = ocrPdfUrl;
            root.FileName = Path.GetFileNameWithoutExtension(root.FileName) + "_OCR.pdf";
            root.ContentType = "application/pdf";
            root.ConvertedPdfUrl = null;
            root.UploadDate = DateTime.UtcNow;
            root.UploadedBy = "OCR";
            root.Version = newVersion;
            root.OcrStatus = "Completed";

            db.CaseDocuments.Add(historyEntry);
            await db.SaveChangesAsync();

            _logger.LogInformation("OCR completed for document {DocumentId}", documentId);
        }
    }
}
