using Microsoft.Extensions.Logging;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using Platform.Application.Abstractions;

namespace Platform.Infrastructure.Services
{
    public class PdfCreatorService : IDocumentCreatorService
    {
        private readonly ILogger<PdfCreatorService> _logger;

        public PdfCreatorService(ILogger<PdfCreatorService> logger)
        {
            _logger = logger;
        }

        public async Task<Stream> CreatePdfFromImagesAsync(IEnumerable<ImageSource> images)
        {
            var sorted = images.OrderBy(i => i.Order).ToList();
            if (sorted.Count == 0)
                throw new ArgumentException("At least one image is required.");

            using var pdf = new PdfDocument();

            foreach (var image in sorted)
            {
                var page = pdf.AddPage();

                using var img = await LoadImageAsync(image.Stream);

                var pageW = page.Width.Point;
                var pageH = page.Height.Point;
                var imgW = img.PixelWidth * 72.0 / img.HorizontalResolution;
                var imgH = img.PixelHeight * 72.0 / img.VerticalResolution;

                double scale;
                if (imgW > imgH)
                    scale = pageW / imgW;
                else
                    scale = pageH / imgH;

                var drawW = imgW * scale;
                var drawH = imgH * scale;
                var x = (pageW - drawW) / 2;
                var y = (pageH - drawH) / 2;

                using var gfx = XGraphics.FromPdfPage(page);
                gfx.DrawImage(img, new XRect(x, y, drawW, drawH));
            }

            var result = new MemoryStream();
            pdf.Save(result, false);
            result.Position = 0;
            return result;
        }

        private static async Task<XImage> LoadImageAsync(Stream stream)
        {
            var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            ms.Position = 0;
            return XImage.FromStream(ms);
        }
    }
}
