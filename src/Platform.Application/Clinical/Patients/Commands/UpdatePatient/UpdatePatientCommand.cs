using System;

namespace Platform.Application.Clinical.Patients.Commands.UpdatePatient
{
    public class UpdatePatientCommand : MediatR.IRequest<Common.Result>
    {
        [System.Text.Json.Serialization.JsonIgnore]
        public Guid PatientId { get; set; }
        
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = default!;
        public string? NationalId { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
    }
}
