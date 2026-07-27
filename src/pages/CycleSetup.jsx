import { useEffect, useState } from "react";
import useCycleStore from "../store/cycleStore";

import PrimaryButton from "../components/PrimaryButton";
import TextInput from "../components/TextInput";
import { showToast } from "../store/toastStore";

const CycleSetup = () => {
  const { createCycle, getActiveCycle } = useCycleStore();

  const today = new Date().toISOString().split("T")[0];

  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [loading, setLoading] = useState(false);

  // Source of truth: GET /api/cycles/active
  // If a cycle exists, store updates and App shows Dashboard
  useEffect(() => {
    getActiveCycle();
  }, []);

  const handleCreateCycle = async () => {
    if (!cycleName.trim()) {
      showToast("error", "Please enter a cycle name.");
      return;
    }

    try {
      setLoading(true);

      // Re-check before create — only one active cycle allowed
      const activeResponse = await getActiveCycle();

      if (activeResponse.success && activeResponse.data) {
        showToast("info", "An active cycle already exists.");
        return;
      }

      const response = await createCycle({
        cycleName: cycleName.trim(),
        startDate,
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to create cycle.");
        return;
      }

      showToast("success", "Salary cycle created successfully.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-5 pb-24"
      style={{ background: "#10002b" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{
          background: "#240046",
          border: "1px solid rgba(224,170,255,.12)",
        }}
      >
        <div className="mb-10 text-center">
          <h1
            className="text-4xl font-bold"
            style={{ color: "#e0aaff" }}
          >
            PocketPilot
          </h1>

          <p
            className="mt-3 text-sm"
            style={{ color: "#c77dff" }}
          >
            Take control of every rupee.
          </p>
        </div>

        <TextInput
          label="Salary Cycle Name"
          placeholder="July 2026 Budget"
          value={cycleName}
          disabled={loading}
          onChange={(e) => setCycleName(e.target.value)}
        />

        <TextInput
          label="Cycle Start Date"
          type="date"
          value={startDate}
          disabled={loading}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <PrimaryButton disabled={loading} onClick={handleCreateCycle}>
          {loading ? "Creating..." : "Create Salary Cycle"}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default CycleSetup;
