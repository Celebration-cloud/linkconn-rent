export function isEmailVerificationRequiredError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error;
  const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";
  const code = typeof candidate.code === "string" ? candidate.code.toLowerCase() : "";
  const status = typeof candidate.status === "number" ? candidate.status : undefined;

  return (
    status === 422 &&
    (message.includes("email verification required") || code === "email_not_confirmed")
  );
}
