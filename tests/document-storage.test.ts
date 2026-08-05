import { describe, expect, it } from "vitest";
import {
  disabledDocumentStorage,
  StorageNotConfiguredError,
} from "@/services/storage/document-storage";

describe("disabled document storage", () => {
  it("reports its capability honestly", () => {
    expect(disabledDocumentStorage.configured).toBe(false);
  });

  it("never returns fake upload success", async () => {
    const file = new File(["identity"], "identity.pdf", {
      type: "application/pdf",
    });
    await expect(
      disabledDocumentStorage.upload(file, "profile-id"),
    ).rejects.toBeInstanceOf(StorageNotConfiguredError);
  });
});
