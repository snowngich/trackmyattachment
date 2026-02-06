/**
 * Maps raw database/auth errors to safe, user-friendly messages.
 * Prevents leaking internal schema details, constraint names, or RLS policy info.
 */
export function getUserFriendlyError(error: unknown): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: string }).message).toLowerCase()
      : "";

  // Auth errors
  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
    return "Invalid email or password.";
  }
  if (message.includes("email not confirmed") || message.includes("email_not_confirmed")) {
    return "Please verify your email address before signing in.";
  }
  if (message.includes("user already registered") || message.includes("user_already_exists")) {
    return "An account with this email already exists.";
  }
  if (message.includes("password") && message.includes("characters")) {
    return "Password must be at least 6 characters.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (message.includes("email rate limit")) {
    return "Too many email requests. Please wait a few minutes and try again.";
  }

  // Database / RLS errors
  if (message.includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("duplicate key") || message.includes("unique constraint")) {
    return "This record already exists.";
  }
  if (message.includes("foreign key") || message.includes("violates foreign key")) {
    return "Cannot complete operation due to related data.";
  }
  if (message.includes("not null") || message.includes("null value")) {
    return "A required field is missing.";
  }
  if (message.includes("invalid input syntax")) {
    return "Invalid data format provided.";
  }
  if (message.includes("permission denied")) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("does not exist")) {
    return "The requested resource was not found.";
  }

  // Network errors
  if (message.includes("failed to fetch") || message.includes("networkerror") || message.includes("network")) {
    return "Network error. Please check your connection and try again.";
  }

  // Default safe message
  return "An unexpected error occurred. Please try again.";
}
