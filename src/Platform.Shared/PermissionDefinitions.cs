using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Shared
{
    public static class PermissionDefinitions
    {
        public static readonly List<string> All = new()
    {
        "Users.View",
        "Users.Create",
        "Users.Update",
        "Users.Delete",
        "Appointments.View",
        "Appointments.Create"
    };
    }
}
