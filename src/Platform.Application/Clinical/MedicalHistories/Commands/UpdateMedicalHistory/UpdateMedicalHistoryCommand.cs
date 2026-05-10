using MediatR;
using Platform.Application.Common;
using System;

namespace Platform.Application.Clinical.MedicalHistories.Commands.UpdateMedicalHistory
{
    public class UpdateMedicalHistoryCommand : IRequest<Result>
    {
        [System.Text.Json.Serialization.JsonIgnore]
        public Guid PatientId { get; set; }
        
        public string? BloodType { get; set; }
        public string? Allergies { get; set; }
        public string? ChronicDiseases { get; set; }
        public string? CurrentMedications { get; set; }
        public string? GeneralNotes { get; set; }
    }
}
