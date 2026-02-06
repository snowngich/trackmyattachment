import { z } from "zod";

/** Validation schema for log entries */
export const logSchema = z.object({
  content: z
    .string()
    .trim()
    .min(10, "Log content must be at least 10 characters.")
    .max(5000, "Log content must be under 5,000 characters."),
  week_number: z
    .number()
    .int("Week number must be a whole number.")
    .min(1, "Week number must be at least 1.")
    .max(52, "Week number cannot exceed 52."),
});

/** Validation schema for feedback comments */
export const feedbackSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(1, "Feedback cannot be empty.")
    .max(2000, "Feedback must be under 2,000 characters."),
});

/** Validation schema for organization creation */
export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Organization name is required.")
    .max(255, "Organization name must be under 255 characters."),
  type: z.enum(["university", "company"], {
    errorMap: () => ({ message: "Type must be university or company." }),
  }),
  address: z
    .string()
    .trim()
    .max(500, "Address must be under 500 characters.")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

/** Validation schema for login */
export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  password: z.string().min(1, "Password is required."),
});

/** Validation schema for signup */
export const signupSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(128, "Password must be under 128 characters."),
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(100, "Full name must be under 100 characters."),
});

/** Validation schema for placement creation */
export const placementSchema = z
  .object({
    student_id: z.string().uuid("Please select a student."),
    company_id: z.string().uuid("Please select a company."),
    supervisor_id: z
      .string()
      .uuid()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    start_date: z.string().min(1, "Start date is required."),
    end_date: z.string().min(1, "End date is required."),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date.",
    path: ["end_date"],
  });
