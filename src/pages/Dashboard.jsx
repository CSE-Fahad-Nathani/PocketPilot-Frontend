import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useCycleStore from "../store/cycleStore";
import useCategoryStore from "../store/categoryStore";
import useIncomeStore from "../store/incomeStore";
import useExpenseStore from "../store/expenseStore";

import FloatingActionButton from "../components/FloatingActionButton";
import BudgetCard from "../components/BudgetCard";
import FixedPaymentCard from "../components/FixedPaymentCard";
import BalanceCard from "../components/BalanceCard";
import FuelAnalysisModal from "../components/FuelAnalysisModal";
import ScreenLayout from "../components/ScreenLayout";
import EndCycleModal from "../components/EndCycleModal";
import { isSimpleExpense, resolveExtraDataType } from "../utils/expenseExtraData";
import { showToast } from "../store/toastStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeCycle, verifyEndCycle, endCycle } = useCycleStore();
  const { categories } = useCategoryStore();
  const { income } = useIncomeStore();
  const { expenses } = useExpenseStore();

  const [endSummary, setEndSummary] = useState(null);
  const [verifyingEnd, setVerifyingEnd] = useState(false);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fuelCategoryName, setFuelCategoryName] = useState("");

  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const totalBudget = categories.reduce(
    (sum, item) => sum + Number(item.budget),
    0
  );

  const currentBalance = totalIncome - totalExpense;
  const savedAmount = totalIncome - totalBudget;

  const spentByCategory = expenses.reduce((acc, expense) => {
    const key = expense.category_id;
    acc[key] = (acc[key] || 0) + Number(expense.amount);
    return acc;
  }, {});

  const { flexibleBudgets, fixedPayments } = useMemo(() => {
    const flexible = [];
    const fixed = [];

    categories.forEach((category) => {
      if (isSimpleExpense(category)) {
        fixed.push(category);
      } else {
        flexible.push(category);
      }
    });

    return { flexibleBudgets: flexible, fixedPayments: fixed };
  }, [categories]);

  const fixedPaidCount = fixedPayments.filter((category) => {
    const spent = spentByCategory[category.id] || 0;
    const budget = Number(category.budget) || 0;
    return budget > 0 && spent >= budget;
  }).length;

  const handleEndCycleClick = async () => {
    if (!activeCycle?.id || verifyingEnd) return;

    try {
      setVerifyingEnd(true);

      const response = await verifyEndCycle({ cycleId: activeCycle.id });

      if (!response.success || !response.data) {
        showToast(
          "error",
          response.message || "Failed to verify cycle summary."
        );
        return;
      }

      setEndSummary(response.data);
    } catch (error) {
      showToast("error", error.message || "Failed to verify cycle summary.");
    } finally {
      setVerifyingEnd(false);
    }
  };

  const handleCancelEnd = () => {
    if (confirmingEnd) return;
    setEndSummary(null);
  };

  const handleConfirmEnd = async () => {
    if (!activeCycle?.id || !endSummary || confirmingEnd) return;

    try {
      setConfirmingEnd(true);

      const today = new Date().toISOString().split("T")[0];
      const response = await endCycle({
        cycleId: activeCycle.id,
        endDate: today,
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to end cycle.");
        return;
      }

      setEndSummary(null);
      showToast("success", "Cycle ended successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      showToast("error", error.message || "Failed to end cycle.");
    } finally {
      setConfirmingEnd(false);
    }
  };

  return (
    <ScreenLayout>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-[#c77dff]">
            Current cycle
          </p>
          <h1 className="truncate text-lg font-bold leading-tight text-white">
            {activeCycle?.cycle_name || activeCycle?.cycleName}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleEndCycleClick}
          disabled={verifyingEnd}
          className="shrink-0 rounded-full border border-[#7b2cbf] px-3 py-1.5 text-xs text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
        >
          {verifyingEnd ? "..." : "End"}
        </button>
      </div>

      <BalanceCard
        currentBalance={currentBalance}
        totalIncome={totalIncome}
        totalBudget={totalBudget}
        totalExpense={totalExpense}
        savedAmount={savedAmount}
      />

      <div className="mb-3 mt-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Budgets</h2>
        <button
          onClick={() => navigate("/categories")}
          className="rounded-full bg-[#5a189a] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#7b2cbf]"
        >
          Manage
        </button>
      </div>

      <div className="mb-4 space-y-2">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-3 py-4 text-center text-sm text-[#c77dff]">
            No budgets yet. Tap Manage to add categories.
          </div>
        ) : flexibleBudgets.length === 0 ? (
          <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-3 py-3 text-center text-xs text-[#c77dff]">
            No flexible budgets. Spending categories will show here.
          </div>
        ) : (
          flexibleBudgets.map((category) => (
            <BudgetCard
              key={category.id}
              category={category}
              spent={spentByCategory[category.id] || 0}
              onExpand={
                resolveExtraDataType(category) === "fuel"
                  ? () => {
                      setFuelCategoryName(category.name);
                      setFuelModalOpen(true);
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>

      {fixedPayments.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Fixed payments
            </h2>
            <span className="text-xs text-[#c77dff]">
              {fixedPaidCount}/{fixedPayments.length} paid
            </span>
          </div>

          <div className="mb-4 space-y-2">
            {fixedPayments.map((category) => (
              <FixedPaymentCard
                key={category.id}
                category={category}
                spent={spentByCategory[category.id] || 0}
              />
            ))}
          </div>
        </>
      )}

      <div className="h-24" />

      <FloatingActionButton
        actions={[
          {
            label: "Add Income",
            icon: "₹",
            onClick: () => navigate("/income"),
          },
          {
            label: "Add Expense",
            icon: "−",
            onClick: () => navigate("/expenses"),
          },
        ]}
      />

      <EndCycleModal
        open={Boolean(endSummary)}
        summary={endSummary}
        cycleId={activeCycle?.id}
        confirming={confirmingEnd}
        onCancel={handleCancelEnd}
        onConfirm={handleConfirmEnd}
        onSummaryChange={setEndSummary}
      />

      <FuelAnalysisModal
        open={fuelModalOpen}
        categoryName={fuelCategoryName}
        onClose={() => setFuelModalOpen(false)}
      />
    </ScreenLayout>
  );
};

export default Dashboard;
