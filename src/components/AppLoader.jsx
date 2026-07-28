import { useEffect, useState } from "react";

const MESSAGES = [
  "Validating credentials",
  "Fetching data",
  "Loading your cycle",
  "Syncing budgets",
  "Preparing dashboard",
  "Almost ready",
];

const AppLoader = ({
  title = "PocketPilot",
  subtitle = "Please wait",
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) =>
        prev < MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 1000);

    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(messageTimer);
      clearInterval(elapsedTimer);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#10002b] px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-[#5a189a]/25 blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-72 w-72 rounded-full bg-[#7b2cbf]/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-[#c77dff]/10 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="app-loader-ring absolute h-20 w-20 rounded-full border-2 border-[#3c096c]" />
          <div className="app-loader-spin absolute h-20 w-20 rounded-full border-2 border-transparent border-t-[#c77dff] border-r-[#9d4edd]" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5a189a] to-[#240046] shadow-[0_0_24px_rgba(157,78,221,0.35)]">
            <span className="text-lg font-bold tracking-tight text-white">PP</span>
          </div>
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#9d4edd]">
          {subtitle}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>

        <p
          key={messageIndex}
          className="app-loader-fade mt-5 min-h-[1.25rem] text-sm text-[#c77dff]"
        >
          {MESSAGES[messageIndex]}
        </p>

        <div className="mx-auto mt-6 h-1 w-44 overflow-hidden rounded-full bg-[#3c096c]">
          <div className="app-loader-bar h-full w-1/2 rounded-full bg-gradient-to-r from-[#7b2cbf] via-[#c77dff] to-[#7b2cbf]" />
        </div>

        <p className="mt-4 text-[11px] tabular-nums text-[#7b2cbf]">
          {elapsed}s
        </p>
      </div>
    </div>
  );
};

export default AppLoader;
