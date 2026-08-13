type PrismaConstraintError = {
  code?: unknown;
  meta?: { target?: unknown };
};

export function isUniqueConstraintFor(
  error: unknown,
  expectedFields: readonly string[],
) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as PrismaConstraintError;
  if (candidate.code !== "P2002") return false;
  const target = candidate.meta?.target;
  const fields = Array.isArray(target)
    ? target.filter((value): value is string => typeof value === "string")
    : typeof target === "string"
      ? [target]
      : [];

  return expectedFields.every((field) =>
    fields.some((value) => value === field || value.includes(field)),
  );
}
