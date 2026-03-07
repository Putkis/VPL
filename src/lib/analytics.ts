type AnalyticsEventName =
  | "page_view"
  | "signup_submit"
  | "signup_success"
  | "signup_error";

type AnalyticsEventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
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
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }

  const sanitizedProps = sanitizeEventProps(props);
  if (sanitizedProps) {
    window.plausible(name, { props: sanitizedProps });
    return;
  }

  window.plausible(name);
}
