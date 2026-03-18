"use client";

export const demoViewerKey = "demo@local.vpl";
const viewerEmailStorageKey = "vpl.viewer.email";

export function getViewerKey() {
  if (typeof window === "undefined") {
    return demoViewerKey;
  }

  return window.localStorage.getItem(viewerEmailStorageKey)?.trim() || demoViewerKey;
}

export function setViewerEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return;
  }

  window.localStorage.setItem(viewerEmailStorageKey, normalizedEmail);
}

export function clearViewerEmail() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(viewerEmailStorageKey);
}
