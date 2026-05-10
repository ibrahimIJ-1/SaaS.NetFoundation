using System;
using Platform.Domain.Common;

namespace Platform.Domain.Clinical
{
    public class Patient : BaseEntity
    {
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

        public bool IsActive { get; set; } = true;

        public string FullName => $"{FirstName} {LastName}";

        public MedicalHistory MedicalHistory { get; set; } = null!;
        public DentalChart DentalChart { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
        public ICollection<TreatmentPlan> TreatmentPlans { get; set; } = new List<TreatmentPlan>();

        public Patient() { }

        public Patient(string firstName, string lastName, DateTime dateOfBirth, string gender)
        {
            FirstName = firstName;
            LastName = lastName;
            DateOfBirth = dateOfBirth;
            Gender = gender;
        }
    }
}
