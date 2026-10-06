/** Auto-created on cycle end for income not allocated to any budget. */
export const UNASSIGNED_LEFT_CATEGORY = {
  name: "Unassigned Left",
  type: "unassigned_left",
  color: "#eab308",
};

export const isUnassignedLeftCategory = (category) => {
  if (!category) return false;
  const type = String(category.type || "").toLowerCase();
  if (type === UNASSIGNED_LEFT_CATEGORY.type) return true;
  return (
    String(category.name || "").trim().toLowerCase() ===
    UNASSIGNED_LEFT_CATEGORY.name.toLowerCase()
  );
};

/** Categories shown when copying budgets from a previous cycle. */
export const isImportableCategory = (category) =>
  !isUnassignedLeftCategory(category);
