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
