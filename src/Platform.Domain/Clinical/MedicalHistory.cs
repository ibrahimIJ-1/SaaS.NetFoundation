using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class MedicalHistory : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = null!;

        public string? BloodType { get; set; }
        
        // Storing as JSON string or comma separated for simplicity in this version
        public string? Allergies { get; set; }
        public string? ChronicDiseases { get; set; }
        public string? CurrentMedications { get; set; }
        
        public string? GeneralNotes { get; set; }

        public MedicalHistory() { }

        public MedicalHistory(Guid patientId)
        {
            PatientId = patientId;
        }
    }
}
