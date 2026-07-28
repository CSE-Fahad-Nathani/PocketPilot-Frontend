export const getBudgetStatus = (percent) => {
  if (percent > 100) {
    return {
      key: "over",
      bar: "#7f1d1d",
      text: "#fca5a5",
      track: "rgba(127, 29, 29, 0.25)",
    };
  }

  if (percent >= 90) {
    return {
      key: "critical",
      bar: "#ef4444",
      text: "#f87171",
      track: "rgba(239, 68, 68, 0.2)",
    };
  }

  if (percent >= 75) {
    return {
      key: "high",
      bar: "#f97316",
      text: "#fb923c",
      track: "rgba(249, 115, 22, 0.2)",
    };
  }

  if (percent >= 50) {
    return {
      key: "mid",
      bar: "#eab308",
      text: "#facc15",
      track: "rgba(234, 179, 8, 0.2)",
    };
  }

  if (percent >= 25) {
    return {
      key: "ok",
      bar: "#84cc16",
      text: "#a3e635",
      track: "rgba(132, 204, 22, 0.2)",
    };
  }

  return {
    key: "safe",
    bar: "#22c55e",
    text: "#4ade80",
    track: "rgba(34, 197, 94, 0.2)",
  };
};
