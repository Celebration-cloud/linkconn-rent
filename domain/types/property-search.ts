import type { Property } from "@/domain/types/property";

export type PropertyPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PropertySearchResult<T = Property> = {
  items: T[];
  pagination: PropertyPagination;
};

export type PropertySearchEnvelope = {
  success: boolean;
  data?: PropertySearchResult;
  message: string;
};
