import test from "node:test";
import assert from "node:assert/strict";
import { isEmailVerificationRequiredError } from "../lib/auth-errors.mjs";

test("treats the auth SDK verification error as a resend/verify flow trigger", () => {
  assert.equal(
    isEmailVerificationRequiredError({ status: 422, message: "Email verification required" }),
    true
  );
});

test("does not treat unrelated auth errors as verification required", () => {
  assert.equal(
    isEmailVerificationRequiredError({ status: 401, message: "Invalid login credentials" }),
    false
  );
});
