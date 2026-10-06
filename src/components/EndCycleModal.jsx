import { useEffect, useState } from "react";

import TextInput from "./TextInput";
import useCategoryStore from "../store/categoryStore";
import useIncomeStore from "../store/incomeStore";
import useExpenseStore from "../store/expenseStore";
import useCycleStore from "../store/cycleStore";
import { showToast } from "../store/toastStore";

const MISSED_CATEGORY_NAME = "Missed";
const MISSED_CATEGORY_COLOR = "#f59e0b";
const MISSED_CATEGORY_TYPE = "custom";

const SCREENS = {
  VERIFY: "verify",
  MENU: "menu",
  INCOME: "income",
  EXPENSE: "expense",
};

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const today = () => new Date().toISOString().split("T")[0];

const SummaryRow = ({ label, value, emphasize = false }) => {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-[#c77dff]">{label}</span>
      <span
        className={`text-sm font-semibold ${
          emphasize ? "text-[#4ade80]" : "text-white"
        }`}
      >
        {formatAmount(value)}
      </span>
    </div>
  );
};

const ModalShell = ({ title, subtitle, busy, onBackdrop, children }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={busy ? undefined : onBackdrop}
        disabled={busy}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-cycle-title"
        className="relative z-10 w-full max-w-sm rounded-t-2xl border border-[#7b2cbf]/40 bg-[#240046] p-4 shadow-2xl shadow-black/50 sm:rounded-2xl"
      >
        <h2
          id="end-cycle-title"
          className="text-base font-semibold text-white"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] text-[#9d4edd]">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

/**
 * Multi-step End Cycle modal.
 * Totals always come from POST /cycles/verify-end — never calculated here.
 *
 * Screens: verify → menu → income|expense → back to verify (refreshed)
 */
const EndCycleModal = ({
  open,
  summary,
  cycleId,
  confirming = false,
  onCancel,
  onConfirm,
  onSummaryChange,
}) => {
  const { categories, createCategory, updateCategory, getCategories } =
    useCategoryStore();
  const { createIncome } = useIncomeStore();
  const { createExpense } = useExpenseStore();
  const { verifyEndCycle } = useCycleStore();

  const [screen, setScreen] = useState(SCREENS.VERIFY);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const busy = confirming || saving;

  useEffect(() => {
    if (!open) {
      setScreen(SCREENS.VERIFY);
      setAmount("");
      setNote("");
      setSaving(false);
    }
  }, [open]);

  if (!open || !summary) return null;

  const refreshSummary = async () => {
    const response = await verifyEndCycle({ cycleId });

    if (!response.success || !response.data) {
      throw new Error(
        response.message || "Failed to refresh cycle summary."
      );
    }

    onSummaryChange(response.data);
    return response.data;
  };

  const resetForm = () => {
    setAmount("");
    setNote("");
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault();

    const value = Number(amount);
    if (!value || value <= 0) {
      showToast("error", "Enter a valid income amount.");
      return;
    }

    try {
      setSaving(true);

      const response = await createIncome({
        cycleId,
        type: "Other",
        amount: value,
        incomeDate: today(),
        note: note.trim() || "Quick adjustment",
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to add income.");
        return;
      }

      await refreshSummary();
      resetForm();
      setScreen(SCREENS.VERIFY);
      showToast("success", "Income adjustment added.");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to add income."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();

    const value = Number(amount);
    if (!value || value <= 0) {
      showToast("error", "Enter a valid expense amount.");
      return;
    }

    try {
      setSaving(true);

      let category = categories.find(
        (item) =>
          String(item.name || "").trim().toLowerCase() ===
          MISSED_CATEGORY_NAME.toLowerCase()
      );

      if (category) {
        const nextBudget = Number(category.budget || 0) + value;
        const updateResponse = await updateCategory({
          id: category.id,
          name: category.name,
          type: category.type || MISSED_CATEGORY_TYPE,
          budget: nextBudget,
          icon: category.icon || "",
          color: category.color || MISSED_CATEGORY_COLOR,
        });

        if (!updateResponse.success) {
          showToast(
            "error",
            updateResponse.message || "Failed to update Missed budget."
          );
          return;
        }

        category = updateResponse.data;
      } else {
        const createResponse = await createCategory({
          cycleId,
          name: MISSED_CATEGORY_NAME,
          type: MISSED_CATEGORY_TYPE,
          budget: value,
          icon: "",
          color: MISSED_CATEGORY_COLOR,
        });

        if (!createResponse.success) {
          showToast(
            "error",
            createResponse.message || "Failed to create Missed budget."
          );
          return;
        }

        category = createResponse.data;
      }

      const expenseResponse = await createExpense({
        cycleId,
        categoryId: category.id,
        expenseDate: today(),
        amount: value,
        reason: "Quick adjustment",
        note: note.trim() || "Missed expense",
      });

      if (!expenseResponse.success) {
        showToast(
          "error",
          expenseResponse.message || "Failed to add missed expense."
        );
        await getCategories(cycleId);
        return;
      }

      await getCategories(cycleId);
      await refreshSummary();
      resetForm();
      setScreen(SCREENS.VERIFY);
      showToast("success", "Missed expense added.");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to add missed expense."
      );
    } finally {
      setSaving(false);
    }
  };

  if (screen === SCREENS.MENU) {
    return (
      <ModalShell
        title="Quick Adjustment"
        subtitle={summary.cycle_name}
        busy={busy}
        onBackdrop={onCancel}
      >
        <p className="mt-2 text-[11px] leading-snug text-[#c77dff]">
          Add forgotten income or create a Missed budget + expense, then
          review totals again.
        </p>

        <div className="mt-3 space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              resetForm();
              setScreen(SCREENS.INCOME);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-[#7b2cbf]/40 bg-[#3c096c]/50 px-3 py-3 text-left transition hover:bg-[#3c096c] disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-medium text-white">Add Income</p>
              <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                Extra / forgotten income
              </p>
            </div>
            <span className="text-[#e0aaff]">→</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              resetForm();
              setScreen(SCREENS.EXPENSE);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-[#7b2cbf]/40 bg-[#3c096c]/50 px-3 py-3 text-left transition hover:bg-[#3c096c] disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-medium text-white">Add Expense</p>
              <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                Goes under Missed budget
              </p>
            </div>
            <span className="text-[#e0aaff]">→</span>
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => setScreen(SCREENS.VERIFY)}
          className="mt-4 w-full rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
        >
          Back
        </button>
      </ModalShell>
    );
  }

  if (screen === SCREENS.INCOME) {
    return (
      <ModalShell
        title="Add Income"
        subtitle="Quick adjustment"
        busy={busy}
        onBackdrop={onCancel}
      >
        <form onSubmit={handleSaveIncome} className="mt-3">
          <TextInput
            compact
            label="Amount"
            type="number"
            name="amount"
            placeholder="500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
          />
          <TextInput
            compact
            label="Note"
            name="note"
            placeholder="Optional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
          />

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                resetForm();
                setScreen(SCREENS.MENU);
              }}
              className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  if (screen === SCREENS.EXPENSE) {
    return (
      <ModalShell
        title="Add Expense"
        subtitle="Creates / updates Missed budget"
        busy={busy}
        onBackdrop={onCancel}
      >
        <form onSubmit={handleSaveExpense} className="mt-3">
          <TextInput
            compact
            label="Amount"
            type="number"
            name="amount"
            placeholder="500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
          />
          <TextInput
            compact
            label="Note"
            name="note"
            placeholder="Optional"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
          />

          <p className="mb-2.5 text-[10px] leading-snug text-[#9d4edd]">
            Amount is added as a Missed category budget and as an expense so
            totals stay correct.
          </p>

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                resetForm();
                setScreen(SCREENS.MENU);
              }}
              className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="End Cycle"
      subtitle={summary.cycle_name}
      busy={busy}
      onBackdrop={onCancel}
    >
      <div className="mt-3 divide-y divide-[#3c096c] rounded-xl border border-[#e0aaff1f] bg-[#3c096c]/40 px-3">
        <SummaryRow label="Total Income" value={summary.total_income} />
        <SummaryRow label="Total Expense" value={summary.total_expense} />
        <SummaryRow
          label="Total Saved"
          value={summary.total_saved}
          emphasize
        />
        {Number(summary.unassigned_left) > 0 ? (
          <SummaryRow
            label="Unassigned Left → budget"
            value={summary.unassigned_left}
          />
        ) : null}
      </div>

      <p className="mt-3 text-[11px] leading-snug text-[#c77dff]">
        {Number(summary.unassigned_left) > 0
          ? "Unassigned Left will be saved as a budget on this cycle (not copied to the next one)."
          : "Please verify the above values before ending this cycle."}
      </p>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="w-full rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
        >
          {confirming ? "Ending..." : "Confirm & End Cycle"}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setScreen(SCREENS.MENU)}
            disabled={busy}
            className="flex-1 rounded-xl border border-[#9d4edd]/50 bg-[#5a189a]/40 px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#5a189a]/70 disabled:opacity-50"
          >
            Quick Adjustment
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default EndCycleModal;
