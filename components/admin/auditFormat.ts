export const ACTION_LABELS: Record<string, string> = {
  "project.approve": "approved & published",
  "project.request_changes": "requested changes on",
  "project.reject": "rejected",
  "project.archive": "archived",
  "project.start_review": "started reviewing",
  "project.reopen": "moved back to pending",
  "project.unpublish": "returned to draft",
  "project.status": "changed status of",
  "project.review_note": "added a review note to",
  "project.feature": "featured",
  "project.unfeature": "unfeatured",
  "project.edit": "edited",
  "project.delete": "deleted project",
  "user.suspend": "suspended",
  "user.reactivate": "reactivated",
  "user.role_change": "changed the role of",
  "user.edit": "edited user",
  "user.delete": "deleted user",
  "settings.update": "updated",
};

export function describeAction(action: string): string {
  return ACTION_LABELS[action] || action.replace(/[._]/g, " ");
}
