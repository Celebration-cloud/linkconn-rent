type EmploymentType =
  | "Employed"
  | "SelfEmployed"
  | "Freelancer"
  | "Student"
  | "Unemployed"
  | "Retired";

export function normalizeOptionalNumberInput(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  return Number(value);
}

export function employmentUsesOrganizationDetails(value: EmploymentType) {
  return value === "Employed" || value === "SelfEmployed" || value === "Freelancer";
}
