using System.IO;
using System.Threading.Tasks;

namespace Platform.Application.Common.Interfaces
{
    public interface IOCRService
    {
        Task<string> ExtractTextAsync(Stream fileStream, string fileName);
    }
}
