namespace Platform.Application.Abstractions
{
    public class ImageSource
    {
        public Stream Stream { get; set; } = default!;
        public string FileName { get; set; } = default!;
        public int Order { get; set; }
    }

    public interface IDocumentCreatorService
    {
        Task<Stream> CreatePdfFromImagesAsync(IEnumerable<ImageSource> images);
    }
}
