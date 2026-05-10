namespace Platform.Shared
{
    public static class FeatureFlags
    {
        public const string Reports = "Reports";
        public const string AuditLog = "AuditLog";
        public const string Notifications = "Notifications";

        public static readonly List<string> All = new()
        {
            Reports,
            AuditLog,
            Notifications,
        };
    }
}
