export interface StoredDocument {
  storageKey: string;
  publicUrl?: string;
}

/* eslint-disable no-unused-vars -- parameter labels document the adapter contract */
export interface DocumentStorage {
  readonly configured: boolean;
  upload(file: File, ownerId: string): Promise<StoredDocument>;
  remove(storageKey: string): Promise<void>;
  read(storageKey: string): Promise<{
    stream: ReadableStream<Uint8Array>;
    contentType: string | null;
    size: number | null;
  } | null>;
  inspect(storageKey: string): Promise<{
    pathname: string;
    contentType: string;
    size: number;
  }>;
}
/* eslint-enable no-unused-vars */

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Document uploads are disabled until a storage provider is configured.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

export const disabledDocumentStorage: DocumentStorage = {
  configured: false,
  async upload() {
    throw new StorageNotConfiguredError();
  },
  async remove() {
    throw new StorageNotConfiguredError();
  },
  async read() {
    throw new StorageNotConfiguredError();
  },
  async inspect() {
    throw new StorageNotConfiguredError();
  },
};

export function getDocumentStorage(): DocumentStorage {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (
    process.env.DOCUMENT_STORAGE_PROVIDER !== "vercel-blob" ||
    !token
  ) {
    return disabledDocumentStorage;
  }

  return {
    configured: true,
    async upload() {
      throw new Error("Server uploads are disabled; use an authenticated direct-upload token.");
    },
    async remove(storageKey) {
      const { del } = await import("@vercel/blob");
      await del(storageKey, { token });
    },
    async read(storageKey) {
      const { get } = await import("@vercel/blob");
      const result = await get(storageKey, {
        access: "private",
        token,
        useCache: false,
      });
      if (!result || !result.stream) return null;
      return {
        stream: result.stream,
        contentType: result.blob.contentType,
        size: result.blob.size,
      };
    },
    async inspect(storageKey) {
      const { head } = await import("@vercel/blob");
      const result = await head(storageKey, { token });
      return {
        pathname: result.pathname,
        contentType: result.contentType,
        size: result.size,
      };
    },
  };
}
import "server-only";
