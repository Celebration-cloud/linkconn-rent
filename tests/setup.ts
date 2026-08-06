import { vi } from "vitest";

vi.mock("next/cache", async (importOriginal) => {
  const original = await importOriginal<typeof import("next/cache")>();
  return {
    ...original,
    cacheLife: vi.fn(),
    cacheTag: vi.fn(),
    revalidateTag: vi.fn(),
    updateTag: vi.fn(),
  };
});
