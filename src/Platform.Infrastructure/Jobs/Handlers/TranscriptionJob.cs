using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Net.Http;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Platform.Application.Abstractions;
using Platform.Application.Common.Interfaces;
using Platform.Domain.Entities.Legal;
using Platform.Persistence;

namespace Platform.Infrastructure.Jobs.Handlers
{
    [DisableConcurrentExecution(60)]
    public class TranscriptionJob
    {
        private readonly IServiceProvider _sp;
        private readonly ILogger<TranscriptionJob> _logger;

        public TranscriptionJob(IServiceProvider sp, ILogger<TranscriptionJob> logger)
        {
            _sp = sp;
            _logger = logger;
        }

        public async Task Execute(Guid recordingId)
        {
            using var scope = _sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var storageService = scope.ServiceProvider.GetRequiredService<IStorageService>();
            var aiService = scope.ServiceProvider.GetRequiredService<IAIService>();
            var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();

            var recording = await db.VoiceRecordings.FindAsync(recordingId);
            if (recording == null)
            {
                _logger.LogWarning("VoiceRecording {RecordingId} not found", recordingId);
                return;
            }

            try
            {
                using var httpClient = httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromMinutes(5);
                using var audioStream = await httpClient.GetStreamAsync(recording.FileUrl);

                var transcription = await aiService.TranscribeVoice(audioStream);

                recording.TranscriptionText = transcription;
                recording.TranscriptionStatus = TranscriptionStatus.Completed;
                recording.ErrorMessage = null;

                var caseNote = new CaseNote
                {
                    LegalCaseId = recording.LegalCaseId,
                    CourtSessionId = recording.CourtSessionId,
                    NoteText = transcription,
                    AuthorName = "نظام التفريغ الصوتي",
                    Date = DateTime.UtcNow
                };
                db.CaseNotes.Add(caseNote);

                _logger.LogInformation("Transcription completed for recording {RecordingId}, case note created", recordingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Transcription failed for recording {RecordingId}", recordingId);
                recording.TranscriptionStatus = TranscriptionStatus.Failed;
                recording.ErrorMessage = ex.Message;
            }

            await db.SaveChangesAsync();
        }
    }
}
