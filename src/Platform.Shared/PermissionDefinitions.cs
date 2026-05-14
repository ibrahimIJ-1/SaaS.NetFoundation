using System.Collections.Generic;

namespace Platform.Shared
{
    public static class PermissionDefinitions
    {
        public static readonly List<string> All = new()
        {
            // ── Users ──
            "Users.View",
            "Users.Create",
            "Users.Update",
            "Users.Delete",

            // ── Roles ──
            "Roles.View",
            "Roles.Create",
            "Roles.Update",
            "Roles.Delete",

            // ── Cases ──
            "Cases.View",
            "Cases.Create",
            "Cases.Update",
            "Cases.Delete",
            "Cases.Assign",
            "Cases.Close",

            // ── Documents ──
            "Documents.View",
            "Documents.Create",
            "Documents.Update",
            "Documents.Delete",
            "Documents.Upload",
            "Documents.Sign",

            // ── Clients ──
            "Clients.View",
            "Clients.Create",
            "Clients.Update",
            "Clients.Delete",
            "Clients.Communicate",

            // ── Calendar ──
            "Calendar.View",
            "Calendar.Create",
            "Calendar.Update",
            "Calendar.Delete",

            // ── Tasks ──
            "Tasks.View",
            "Tasks.Create",
            "Tasks.Update",
            "Tasks.Delete",
            "Tasks.Assign",

            // ── Billing & Financial ──
            "Billing.ViewInvoices",
            "Billing.CreateInvoices",
            "Billing.EditInvoices",
            "Billing.DeleteInvoices",
            "Billing.RecordPayments",
            "Billing.ViewReports",
            "Billing.ManageTrust",

            // ── Communication ──
            "Communication.View",
            "Communication.Send",

            // ── Reports ──
            "Reports.ViewOperational",
            "Reports.ViewFinancial",
            "Reports.ViewClinical",
            "Reports.ViewAdministrative",
            "Reports.Export",

            // ── Settings ──
            "Settings.View",
            "Settings.Update",
            "Settings.ManageFeatures",

            // ── Audit ──
            "Audit.View",

            // ── Notifications ──
            "Notifications.View",
            "Notifications.Manage",
        };

        public static readonly Dictionary<string, List<string>> DefaultRolePermissions = new()
        {
            ["Lawyer"] = new()
            {
                "Cases.View", "Cases.Create", "Cases.Update", "Cases.Delete", "Cases.Assign", "Cases.Close",
                "Documents.View", "Documents.Create", "Documents.Update", "Documents.Delete", "Documents.Upload", "Documents.Sign",
                "Clients.View", "Clients.Create", "Clients.Update", "Clients.Delete", "Clients.Communicate",
                "Calendar.View", "Calendar.Create", "Calendar.Update", "Calendar.Delete",
                "Tasks.View", "Tasks.Create", "Tasks.Update", "Tasks.Delete", "Tasks.Assign",
                "Billing.ViewInvoices", "Billing.CreateInvoices", "Billing.EditInvoices", "Billing.RecordPayments", "Billing.ViewReports", "Billing.ManageTrust",
                "Communication.View", "Communication.Send",
                "Reports.ViewOperational", "Reports.ViewFinancial", "Reports.ViewAdministrative", "Reports.Export",
                "Notifications.View", "Notifications.Manage",
            },
            ["Secretary"] = new()
            {
                "Cases.View", "Cases.Create", "Cases.Update",
                "Documents.View", "Documents.Create", "Documents.Update", "Documents.Upload",
                "Clients.View", "Clients.Create", "Clients.Update", "Clients.Communicate",
                "Calendar.View", "Calendar.Create", "Calendar.Update",
                "Tasks.View", "Tasks.Create", "Tasks.Update",
                "Communication.View", "Communication.Send",
                "Notifications.View",
            },
            ["Accountant"] = new()
            {
                "Cases.View",
                "Clients.View",
                "Billing.ViewInvoices", "Billing.CreateInvoices", "Billing.EditInvoices", "Billing.RecordPayments", "Billing.ViewReports", "Billing.ManageTrust",
                "Reports.ViewFinancial", "Reports.ViewAdministrative", "Reports.Export",
                "Notifications.View",
            },
        };
    }
}
