export interface StoredDocument {
  storageKey: string;
  publicUrl?: string;
}

/* eslint-disable no-unused-vars -- parameter labels document the adapter contract */
export interface DocumentStorage {
  readonly configured: boolean;
  upload(file: File, ownerId: string): Promise<StoredDocument>;
  remove(storageKey: string): Promise<void>;
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
};

export function getDocumentStorage(): DocumentStorage {
  return disabledDocumentStorage;
}
import "server-only";
