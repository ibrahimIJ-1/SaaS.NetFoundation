namespace Platform.Shared
{
    public static class FeatureFlags
    {
        public const string Patients = "Patients";
        public const string Appointments = "Appointments";
        public const string Visits = "Visits";
        public const string DentalChart = "DentalChart";
        public const string TreatmentPlans = "TreatmentPlans";
        public const string Sessions = "Sessions";
        public const string Prescriptions = "Prescriptions";
        public const string LabRequests = "LabRequests";
        public const string Imaging = "Imaging";
        public const string Billing = "Billing";
        public const string Payments = "Payments";
        public const string Insurance = "Insurance";
        public const string Inventory = "Inventory";
        public const string Suppliers = "Suppliers";
        public const string Branches = "Branches";
        public const string Rooms = "Rooms";
        public const string Doctors = "Doctors";
        public const string Reports = "Reports";
        public const string AuditLog = "AuditLog";
        public const string Notifications = "Notifications";

        public static readonly List<string> All = new()
        {
            Patients,
            Appointments,
            Visits,
            DentalChart,
            TreatmentPlans,
            Sessions,
            Prescriptions,
            LabRequests,
            Imaging,
            Billing,
            Payments,
            Insurance,
            Inventory,
            Suppliers,
            Branches,
            Rooms,
            Doctors,
            Reports,
            AuditLog,
            Notifications,
        };
    }
}
