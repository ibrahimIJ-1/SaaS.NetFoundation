using System;

namespace Platform.Application.Clinical.MedicalHistories.DTOs
{
    public class MedicalHistoryDto
    {
        public Guid PatientId { get; set; }
        public string? BloodType { get; set; }
        public string? Allergies { get; set; }
        public string? ChronicDiseases { get; set; }
        public string? CurrentMedications { get; set; }
        public string? GeneralNotes { get; set; }
    }
}
