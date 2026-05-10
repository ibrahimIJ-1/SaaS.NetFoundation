namespace Platform.Shared
{
    public static class PermissionDefinitions
    {
        public static readonly List<string> All = new()
        {
            // Users
            "Users.View",
            "Users.Create",
            "Users.Update",
            "Users.Delete",

            // Roles
            "Roles.View",
            "Roles.Create",
            "Roles.Update",
            "Roles.Delete",

            // Patients
            "Patients.View",
            "Patients.Create",
            "Patients.Update",
            "Patients.Delete",
            "Patients.Export",
            "Patients.ViewMedicalHistory",
            "Patients.EditMedicalHistory",

            // Appointments
            "Appointments.View",
            "Appointments.Create",
            "Appointments.Update",
            "Appointments.Delete",
            "Appointments.Reschedule",
            "Appointments.Cancel",

            // Visits
            "Visits.View",
            "Visits.Create",
            "Visits.Update",
            "Visits.CheckIn",

            // Clinical / Dental Chart
            "Clinical.ViewDentalChart",
            "Clinical.EditDentalChart",
            "Clinical.ViewNotes",
            "Clinical.CreateNotes",
            "Clinical.EditNotes",
            "Clinical.ViewDiagnosis",
            "Clinical.CreateDiagnosis",

            // Treatment Plans
            "TreatmentPlans.View",
            "TreatmentPlans.Create",
            "TreatmentPlans.Update",
            "TreatmentPlans.Approve",
            "TreatmentPlans.Delete",

            // Sessions
            "Sessions.View",
            "Sessions.Create",
            "Sessions.Update",
            "Sessions.Complete",

            // Prescriptions
            "Prescriptions.View",
            "Prescriptions.Create",
            "Prescriptions.Update",
            "Prescriptions.Delete",

            // Lab Requests
            "LabRequests.View",
            "LabRequests.Create",
            "LabRequests.Update",
            "LabRequests.Delete",

            // Imaging / Attachments
            "Imaging.View",
            "Imaging.Upload",
            "Imaging.Delete",

            // Billing / Invoices
            "Billing.View",
            "Billing.Create",
            "Billing.Update",
            "Billing.Delete",
            "Billing.ApplyDiscount",
            "Billing.Refund",
            "Billing.ViewReports",

            // Payments
            "Payments.View",
            "Payments.Create",
            "Payments.Void",

            // Insurance
            "Insurance.View",
            "Insurance.Create",
            "Insurance.Update",
            "Insurance.ManageClaims",

            // Inventory
            "Inventory.View",
            "Inventory.Create",
            "Inventory.Update",
            "Inventory.Delete",
            "Inventory.ManageStock",
            "Inventory.ViewReports",

            // Suppliers
            "Suppliers.View",
            "Suppliers.Create",
            "Suppliers.Update",
            "Suppliers.Delete",

            // Branches
            "Branches.View",
            "Branches.Create",
            "Branches.Update",
            "Branches.Delete",

            // Rooms / Chairs
            "Rooms.View",
            "Rooms.Create",
            "Rooms.Update",
            "Rooms.Delete",

            // Doctors
            "Doctors.View",
            "Doctors.Create",
            "Doctors.Update",
            "Doctors.Delete",
            "Doctors.ManageSchedule",

            // Reports
            "Reports.ViewOperational",
            "Reports.ViewFinancial",
            "Reports.ViewClinical",
            "Reports.ViewAdministrative",
            "Reports.Export",

            // Settings
            "Settings.View",
            "Settings.Update",
            "Settings.ManageFeatures",

            // Audit
            "Audit.View",

            // Notifications
            "Notifications.View",
            "Notifications.Manage",
        };
    }
}
