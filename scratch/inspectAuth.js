import { authClient } from "../lib/auth/client.js";

console.log(
  "authClient.emailOtp result keys:",
  Object.keys(authClient.emailOtp),
);
console.log(
  "authClient.emailOtp prototype properties:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(authClient.emailOtp)),
);
console.log(
  "authClient.emailOtp properties:",
  Object.getOwnPropertyNames(authClient.emailOtp),
);

// Let's print the actual function definition or keys on it
const keysOfEmailOtp = Object.getOwnPropertyNames(authClient.emailOtp);

for (const key of keysOfEmailOtp) {
  console.log(`Property ${key}:`, authClient.emailOtp[key]);
}

// Let's inspect properties of authClient itself
const clientKeys = Object.getOwnPropertyNames(authClient);

console.log("authClient instance properties:", clientKeys);

// If it's a proxy or dynamic client:
console.log(
  "Calling authClient.emailOtp as function:",
  typeof authClient.emailOtp,
);
try {
  const emailOtpInstance = authClient.emailOtp;

  console.log("Is emailOtpInstance a function?", typeof emailOtpInstance);
  console.log(
    "emailOtpInstance properties:",
    Object.getOwnPropertyNames(emailOtpInstance),
  );
  // Wait, is verifyEmail or sendVerificationOtp on emailOtpInstance?
  console.log(
    "emailOtpInstance.verifyEmail type:",
    typeof emailOtpInstance.verifyEmail,
  );
  console.log(
    "emailOtpInstance.sendVerificationOtp type:",
    typeof emailOtpInstance.sendVerificationOtp,
  );
} catch (e) {
  console.log("Error inspecting emailOtpInstance:", e.message);
}
