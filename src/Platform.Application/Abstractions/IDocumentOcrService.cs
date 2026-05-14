namespace Platform.Application.Abstractions
{
    public interface IDocumentOcrService
    {
        bool CanOcr(string contentType, string? fileName = null);
        Task<Stream> OcrToSearchablePdfAsync(Stream fileStream, string fileName, string language = "ara+eng");
    }
}
