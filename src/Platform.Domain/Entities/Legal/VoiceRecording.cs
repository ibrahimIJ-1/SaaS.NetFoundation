using Platform.Domain.Common;

namespace Platform.Domain.Entities.Legal
{
    public enum TranscriptionStatus
    {
        Pending,
        Processing,
        Completed,
        Failed
    }

    public class VoiceRecording : AuditableEntity
    {
        public Guid LegalCaseId { get; set; }
        public Guid? CourtSessionId { get; set; }
        public string FileUrl { get; set; } = default!;
        public string FileName { get; set; } = default!;
        public long FileSizeBytes { get; set; }
        public int DurationSeconds { get; set; }
        public TranscriptionStatus TranscriptionStatus { get; set; } = TranscriptionStatus.Pending;
        public string? TranscriptionText { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

        public LegalCase LegalCase { get; set; } = null!;
        public CourtSession? CourtSession { get; set; }
    }
}
