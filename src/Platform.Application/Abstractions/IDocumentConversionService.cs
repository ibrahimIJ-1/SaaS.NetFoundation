using System.IO;
using System.Threading.Tasks;

namespace Platform.Application.Abstractions
{
    public interface IDocumentConversionService
    {
        bool CanConvert(string contentType);
        Task<Stream> ConvertToPdfAsync(Stream fileStream, string fileName);
    }
}
