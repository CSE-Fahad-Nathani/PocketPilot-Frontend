import { getServerOrigin } from "./api";

let wakePromise = null;

/**
 * Ping the Render root so a sleeping free-tier instance starts waking.
 * Safe to call multiple times — shares one in-flight attempt.
 */
export const wakeServer = () => {
  if (wakePromise) return wakePromise;

  const origin = getServerOrigin();

  wakePromise = (async () => {
    const maxAttempts = 12;
    const delayMs = 2500;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(`${origin}/`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(timeout);

        if (response.ok) {
          return { success: true, attempt };
        }
      } catch {
        // Cold start / network — keep retrying.
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    wakePromise = null;
    return { success: false };
  })();

  return wakePromise;
};

export const resetWakeState = () => {
  wakePromise = null;
};
