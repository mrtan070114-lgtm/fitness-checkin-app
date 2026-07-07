const NETWORK_ERROR_PATTERN = /fetch failed|failed to fetch|network|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ECONNREFUSED/i;

function readErrorMessage(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "";
}

export function getFriendlySupabaseError(error: unknown) {
  const message = readErrorMessage(error);

  if (!message) return null;
  if (NETWORK_ERROR_PATTERN.test(message)) {
    return "网络连接不稳定，请重试";
  }

  return message;
}
