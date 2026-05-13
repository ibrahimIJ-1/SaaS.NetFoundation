using System.IO;
using System.Threading.Tasks;

namespace Platform.Application.Common.Interfaces
{
    public interface IAIService
    {
        Task<string> Chat(string prompt, string? context = null);
        Task<string> SummarizeLegalText(string text);
        Task<string> AnalyzeDocument(string text);
        Task<string> TranscribeVoice(Stream audioStream);
    }
}
