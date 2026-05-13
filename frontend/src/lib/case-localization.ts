export const CASE_STATUS_LABELS: Record<string, string> = {
  "Active": "نشط",
  "Pending": "معلق",
  "Won": "رابحة",
  "Lost": "خاسرة",
  "Settled": "تمت التسوية",
  "Archived": "مؤرشف",
  "Canceled": "ملغاة"
};

export const CASE_PRIORITY_LABELS: Record<string, string> = {
  "Low": "منخفضة",
  "Medium": "متوسطة",
  "High": "عالية",
  "Urgent": "عاجلة"
};

export const CASE_TYPE_LABELS: Record<string, string> = {
  "Criminal": "جنائي",
  "Civil": "مدني",
  "Commercial": "تجاري",
  "Labor": "عمالي",
  "PersonalStatus": "أحوال شخصية",
  "Administrative": "إداري",
  "Other": "آخر"
};

export function getStatusLabel(status: string) {
  return CASE_STATUS_LABELS[status] || status;
}

export function getPriorityLabel(priority: string) {
  return CASE_PRIORITY_LABELS[priority] || priority;
}

export function getCaseTypeLabel(type: string) {
  return CASE_TYPE_LABELS[type] || type;
}
