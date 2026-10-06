import { useEffect, useState } from "react";
import useCycleStore from "../store/cycleStore";
import useCategoryStore from "../store/categoryStore";
import useIncomeStore from "../store/incomeStore";
import useExpenseStore from "../store/expenseStore";
import useCategoryTransferStore from "../store/categoryTransferStore";
import useAuthStore from "../store/authStore";
import * as cycleService from "../services/cycleService";
import categoryService from "../services/categoryService";

import PrimaryButton from "../components/PrimaryButton";
import TextInput from "../components/TextInput";
import ImportBudgetsModal from "../components/ImportBudgetsModal";
import { showToast } from "../store/toastStore";
import { isImportableCategory } from "../utils/categoryFlags";

const CycleSetup = () => {
  const { getActiveCycle } = useCycleStore();
  const { getCategories } = useCategoryStore();
  const { getIncome } = useIncomeStore();
  const { getExpenses } = useExpenseStore();
  const { getTransfers } = useCategoryTransferStore();
  const setCycleId = useAuthStore((state) => state.setCycleId);

  const today = new Date().toISOString().split("T")[0];

  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const [previousCycle, setPreviousCycle] = useState(null);
  const [copyBudgets, setCopyBudgets] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [sourceCategories, setSourceCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingSource, setLoadingSource] = useState(false);

  useEffect(() => {
    getActiveCycle();

    const loadPrevious = async () => {
      try {
        const response = await cycleService.getCycleHistory();
        const latest = response.success ? response.data?.[0] : null;

        if (latest) {
          setPreviousCycle(latest);
          setCopyBudgets(true);
        }
      } catch {
        setPreviousCycle(null);
      }
    };

    loadPrevious();
  }, []);

  const loadSourceCategories = async (cycleId) => {
    setLoadingSource(true);

    try {
      const response = await categoryService.getCategories(cycleId);
      const importable = (response.data || []).filter(isImportableCategory);

      if (response.success && importable.length) {
        setSourceCategories(importable);
        setSelectedIds(importable.map((item) => item.id));
        return true;
      }

      setSourceCategories([]);
      setSelectedIds([]);
      return false;
    } catch {
      setSourceCategories([]);
      setSelectedIds([]);
      return false;
    } finally {
      setLoadingSource(false);
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const refreshNewCycleData = async (cycleId) => {
    await Promise.all([
      getCategories(cycleId),
      getIncome(cycleId),
      getExpenses(cycleId),
      getTransfers(cycleId),
    ]);
    await getActiveCycle();
    setCycleId(cycleId);
  };

  const createCycleAndMaybeImport = async (categoryIds) => {
    const response = await cycleService.createCycle({
      cycleName: cycleName.trim(),
      startDate,
    });

    if (!response.success || !response.data?.id) {
      showToast("error", response.message || "Failed to create cycle.");
      return false;
    }

    const newCycleId = response.data.id;

    if (categoryIds?.length && previousCycle?.id) {
      const importResponse = await categoryService.importCategoriesFromCycle({
        targetCycleId: newCycleId,
        sourceCycleId: previousCycle.id,
        categoryIds,
      });

      if (!importResponse.success) {
        await refreshNewCycleData(newCycleId);
        showToast(
          "error",
          importResponse.message ||
            "Cycle created, but budgets could not be imported."
        );
        return true;
      }

      await refreshNewCycleData(newCycleId);
      showToast(
        "success",
        `Cycle created with ${importResponse.data.importedCount} budget${
          importResponse.data.importedCount === 1 ? "" : "s"
        }.`
      );
      return true;
    }

    await refreshNewCycleData(newCycleId);
    showToast("success", "Salary cycle created successfully.");
    return true;
  };

  const handleCreateCycle = async () => {
    if (!cycleName.trim()) {
      showToast("error", "Please enter a cycle name.");
      return;
    }

    try {
      setLoading(true);

      const activeResponse = await getActiveCycle();

      if (activeResponse.success && activeResponse.data) {
        showToast("info", "An active cycle already exists.");
        return;
      }

      if (copyBudgets && previousCycle?.id) {
        const hasCategories = await loadSourceCategories(previousCycle.id);

        if (!hasCategories) {
          showToast(
            "info",
            "No budgets in the previous cycle. Creating empty cycle."
          );
          await createCycleAndMaybeImport([]);
          return;
        }

        setImportOpen(true);
        return;
      }

      await createCycleAndMaybeImport([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedIds.length) {
      showToast("error", "Select at least one budget to import.");
      return;
    }

    try {
      setLoading(true);
      setImportOpen(false);
      await createCycleAndMaybeImport(selectedIds);
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
          <img
            src="/favicon.jpg"
            alt="PocketPilot"
            className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-[0_0_28px_rgba(157,78,221,0.35)]"
          />
          <h1 className="text-4xl font-bold" style={{ color: "#e0aaff" }}>
            PocketPilot
          </h1>

          <p className="mt-3 text-sm" style={{ color: "#c77dff" }}>
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

        {previousCycle && (
          <label className="mb-5 flex items-center justify-between rounded-xl border border-[#3c096c] bg-[#3c096c]/25 px-3 py-3">
            <div className="min-w-0 pr-3">
              <p className="text-sm font-medium text-white">
                Copy budgets from previous
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[#9d4edd]">
                From {previousCycle.cycle_name || previousCycle.cycleName}
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => setCopyBudgets((prev) => !prev)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                copyBudgets ? "bg-[#22d3ee]" : "bg-[#3c096c]"
              }`}
              aria-pressed={copyBudgets}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  copyBudgets ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
        )}

        <PrimaryButton disabled={loading} onClick={handleCreateCycle}>
          {loading ? "Creating..." : "Create Salary Cycle"}
        </PrimaryButton>
      </div>

      <ImportBudgetsModal
        open={importOpen}
        sourceCycleName={previousCycle?.cycle_name || previousCycle?.cycleName}
        categories={sourceCategories}
        selectedIds={selectedIds}
        loading={loadingSource}
        saving={loading}
        onClose={() => setImportOpen(false)}
        onToggle={toggleSelected}
        onSelectAll={() =>
          setSelectedIds(sourceCategories.map((item) => item.id))
        }
        onClearAll={() => setSelectedIds([])}
        onConfirm={handleConfirmImport}
        confirmLabel="Create & Import"
      />
    </div>
  );
};

export default CycleSetup;
