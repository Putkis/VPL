export type RuntimeTags = {
  environment: string;
  release: string;
};

export function getRuntimeTags(): RuntimeTags {
  return {
    environment:
      process.env.NEXT_PUBLIC_APP_ENV ??
      process.env.APP_ENV ??
      process.env.NODE_ENV ??
      "development",
    release:
      process.env.NEXT_PUBLIC_APP_RELEASE ??
      process.env.APP_RELEASE ??
      process.env.GITHUB_SHA ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      "local-dev"
  };
}

export function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null
    };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return {
      name:
        "name" in error && typeof error.name === "string" ? error.name : "UnknownError",
      message: error.message,
      stack:
        "stack" in error && typeof error.stack === "string" ? error.stack : null
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : "Unknown error",
    stack: null
  };
}
