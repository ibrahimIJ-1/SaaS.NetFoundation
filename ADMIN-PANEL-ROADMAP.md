# Admin Panel & Permission System — Frontend Roadmap

## Phase A — Fix Existing Pages

- [x] A1. Add Users & Roles links to sidebar
- [x] A2. Fix permission names mismatch (add Cases.View, Documents.View, Clients.View to backend)
- [x] A3. Fix Users page bugs (role ID vs name, `assignRoles` sends plain array, `UserDto` types match backend, `FullName` returned from GetAll)
- [x] A4. Fix Roles page bugs (create role sends `{ name, permissionIds: [] }`, add back-navigation button)
- [x] A5. Arabic localization for Users & Roles pages

## Phase B — New Pages

- [x] B1. Settings page — feature flags toggle UI
- [x] B2. My Profile page — view/edit profile, change password (requires `PUT /api/auth/profile` backend endpoint)
- [x] B3. User Permissions Matrix page
- [x] B4. User Detail / Permission Editor page (with role assignment)

## Phase C — Enhanced Permissions & Seed Data

- [x] C1. Extend PermissionDefinitions with law-firm permissions (~30+ permissions across Cases, Documents, Clients, Calendar, Tasks, Billing, Communication)
- [x] C2. Add `EnsureTenantSeedsAsync` method + call from Program.cs startup for existing tenants
- [x] C3. Add default roles: Lawyer, Secretary, Accountant (with tailored permission sets)

## Phase D — UI Permission Gating

- [x] D1. Create `<Can>`, `<CanRole>`, `<CanFeature>` components and gate UI elements (users/roles/settings pages)
- [x] D2. Audit log viewer page (placeholder — requires backend endpoint)

## Phase E — Polish

- [x] E1. Loading states & error boundaries (ErrorBoundary component, not-found page)
- [x] E2. Responsive design for admin views (existing Tailwind responsive classes)
- [x] E3. Empty states with guidance (all table/list pages have empty state messages)

## Phase F — RTL & Arabic Content Audit

### F1. Global RTL Setup
- [ ] Verify `<html dir="rtl">` or equivalent is set on the document root
- [ ] Check `globals.css` for RTL-aware base styles (Tailwind v4 RTL support)
- [ ] Verify `next.config` handles RTL properly

### F2. Checkbox + Label Order (document-wide audit)
- [ ] `roles/page.tsx` — permissions modal: swap `<input>` and `<Label>` order, remove `mr-3`, remove `space-x-reverse`
- [ ] `users/page.tsx` — assign roles modal: swap `<input>` and `<Label>` order, remove `mr-3`, remove `space-x-reverse`
- [ ] `users/[id]/page.tsx` — assign roles dialog: swap `<input>` and `<Label>` order, remove `mr-3`, remove `space-x-reverse`

### F3. Button Icon Placement
- [ ] Audit ALL pages for icon + button text ordering (icon on left vs right)
  - In RTL, icons should appear AFTER text (left of text): replace `ml-*` on icons with `mr-*`
  - Example: `<Plus className="w-4 h-4 ml-2" />` → `<Plus className="w-4 h-4 mr-2" />` so icon is on the left side of the button in RTL
- [ ] Search for all `<* className="... ml-*" />` icon patterns in button contexts
- [ ] Fix icon margins across: `users/page.tsx`, `roles/page.tsx`, `settings/page.tsx`, `profile/page.tsx`, `permission-matrix/page.tsx`, `users/[id]/page.tsx`, `audit/page.tsx`

### F4. DropdownMenu Alignment
- [ ] Audit all `DropdownMenuContent` `align` props — `align="end"` positions correctly in LTR but may be wrong in RTL
- [ ] Check `users/page.tsx:249` — `align="end"` should be correct for RTL (end → left edge in RTL)
- [ ] Check `roles/page.tsx:176` — same
- [ ] Verify `DropdownMenu` component in `frontend/src/components/ui/dropdown-menu.tsx` handles RTL

### F5. Table Column Alignment
- [ ] Audit all `TableHead` with `text-right` className — should be `text-right` for RTL (since tables don't auto-revert)
- [ ] Audit `TableCell` with `text-right` — verify alignment matches expected RTL reading
- [ ] Check `TableHeader` and `TableRow` for `text-slate-400` headers ordering — should be from right (most important) to left

### F6. Dialog/Modal RTL
- [ ] Verify `DialogContent` RTL padding/margins
- [ ] Check `DialogFooter` button ordering — in RTL, primary action should be on the left? Or right?
- [ ] Check `DialogTitle` icon placement (e.g., `<AlertTriangle className="mr-2" />` should be `ml-2` in RTL)

### F7. Card/Tile RTL
- [ ] Audit `CardHeader` + `CardTitle` icon/text ordering
- [ ] Audit `CardContent` internal layouts

### F8. Form Layout RTL
- [ ] Audit `Label` + `Input` positioning in RTL
- [ ] Check `select` elements in RTL
- [ ] Verify form field ordering (label on right in RTL)

### F9. Sidebar RTL
- [ ] Verify sidebar items icon/text order
- [ ] Check `mr-*`/`ml-*` usage in `sidebar.tsx`
- [ ] Verify user section avatar + name alignment

### F10. Navigation/Breadcrumbs
- [ ] Audit any breadcrumb or nav components for RTL arrow directions

### F11. Arabic Text Audit
- [ ] `roles/page.tsx`: permission names displayed as `permission.name.split('.')[1]` — these are English (e.g., "View", "Create"). Map to Arabic equivalents or show full name with Arabic description
- [ ] `users/page.tsx`: role names in checkboxes — when roles are named in English like "Admin", "Lawyer", display Arabic translations
- [ ] `settings/page.tsx`: feature keys are English — add Arabic descriptions
- [ ] `audit/page.tsx`: all labels should be Arabic

### F12. Calendar & Date Formatting
- [ ] Verify RTL-compatible date formatting (use `date-fns` with `locale: ar`)
- [ ] Check all date displays use Arabic numerals or appropriate format
