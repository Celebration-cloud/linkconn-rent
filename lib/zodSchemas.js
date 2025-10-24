import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  author_id: z.string(),
});
export const userSchema = z.object({
    id: z.string(),
    name: z.string().min(2),
    email: z.email(),
    created_at: z.string().optional(),
});
export const commentSchema = z.object({
    post_id: z.string(),
    author_id: z.string(),
    content: z.string().min(1),
    created_at: z.string().optional(),
});
export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});
export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
});
export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.email().optional(),
});
export const aiRequestSchema = z.object({
    prompt: z.string().min(1),
    model: z.string().optional(),
});
export const aiResponseSchema = z.object({
    response: z.string(),
    model: z.string(),
    created_at: z.string().optional(),
});
export const fileSchema = z.object({
    filename: z.string().min(1),
    url: z.url(),
    size: z.number().nonnegative(),
    uploaded_at: z.string().optional(),
});
export const workerTaskSchema = z.object({
    task_id: z.string(),
    status: z.enum(["pending", "in_progress", "completed", "failed"]),
    result: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
export const paginationSchema = z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(10),
});
export const sortSchema = z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});
export const filterSchema = z.object({
    searchTerm: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
});
export const apiResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any().optional(),
});

export const listingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  ownerId: z.string(), // uuid or string id
  images: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

export const bookingSchema = z.object({
  id: z.string().optional(),
  listingId: z.string(),
  userId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
});
