using System.IO;
using System.Threading.Tasks;

namespace Platform.Application.Abstractions
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(Stream stream, string fileName, string contentType);
        Task DeleteFileAsync(string fileUrl);
    }
}
