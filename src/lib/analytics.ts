type AnalyticsEventName =
  | "page_view"
  | "signup_submit"
  | "signup_success"
  | "signup_error";

type AnalyticsEventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizeEventProps(props?: AnalyticsEventProps) {
  if (!props) {
    return undefined;
  }

  const sanitizedEntries = Object.entries(props).filter(
    ([, value]) => value !== undefined
  ) as Array<[string, string | number | boolean]>;

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries);
}

export function trackEvent(name: AnalyticsEventName, props?: AnalyticsEventProps) {
  const globalObject = globalThis as typeof globalThis & { window?: Window };
  const browserWindow = globalObject.window;

  if (!browserWindow || typeof browserWindow.gtag !== "function") {
    return;
  }

  const sanitizedProps = sanitizeEventProps(props);
  if (sanitizedProps) {
    browserWindow.gtag("event", name, sanitizedProps);
    return;
  }

  browserWindow.gtag("event", name);
}
