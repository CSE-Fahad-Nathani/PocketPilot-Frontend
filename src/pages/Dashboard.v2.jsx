/**
 * Dashboard VERSION 2 — premium mobile dashboard (dense, above-the-fold).
 * Rollback: change pages/Dashboard.jsx to export from "./Dashboard.v1"
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FiSettings } from "react-icons/fi";

import useCycleStore from "../store/cycleStore";
import useCategoryStore from "../store/categoryStore";
import useIncomeStore from "../store/incomeStore";
import useExpenseStore from "../store/expenseStore";
import useAuthStore from "../store/authStore";

import FloatingActionButton from "../components/FloatingActionButton";
import FuelAnalysisModal from "../components/FuelAnalysisModal";
import TrackedBalanceSettingsModal from "../components/TrackedBalanceSettingsModal";
import ScreenLayout from "../components/ScreenLayout";
import EndCycleModal from "../components/EndCycleModal";
import {
  isSimpleExpense,
  resolveExtraDataType,
} from "../utils/expenseExtraData";
import { getBudgetStatus } from "../utils/budgetStatus";
import { showToast } from "../store/toastStore";
import {
  getTrackedBalanceSettings,
  saveTrackedBalanceSettings,
} from "../services/trackedBalanceService";

const CHART_PALETTE = [
  "#06b6d4",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#f97316",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
];

const formatMoney = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

const formatCompact = (value) => {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  }
  return formatMoney(amount);
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-[#5a189a] bg-[#240046] px-2 py-1.5 shadow-xl">
      <p className="text-[10px] text-[#c77dff]">{item.name}</p>
      <p className="text-xs font-semibold text-white">
        {formatMoney(item.value)}
      </p>
    </div>
  );
};

const MiniDonut = ({ title, data, centerValue }) => {
  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-2 py-2">
        <p className="text-[11px] font-semibold text-white">{title}</p>
        <p className="py-6 text-center text-[10px] text-[#9d4edd]">No data</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-2 py-2">
      <p className="mb-0.5 text-center text-[11px] font-semibold text-white">
        {title}
      </p>
      <div className="relative mx-auto h-[92px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={28}
              outerRadius={40}
              paddingAngle={2}
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.fill || CHART_PALETTE[index % CHART_PALETTE.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-[11px] font-bold text-white">{centerValue}</p>
        </div>
      </div>
      <div className="mt-0.5 space-y-0.5">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-1"
          >
            <div className="flex min-w-0 items-center gap-1">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background:
                    item.fill || CHART_PALETTE[index % CHART_PALETTE.length],
                }}
              />
              <span className="truncate text-[9px] text-[#c77dff]">
                {item.name}
              </span>
            </div>
            <span className="shrink-0 text-[9px] font-medium text-white">
              {formatCompact(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompactBudgetRow = ({ category, spent, onExpand }) => {
  const budget = Number(category.budget) || 0;
  const spentAmount = Number(spent) || 0;
  const remaining = budget - spentAmount;
  const rawPercent = budget > 0 ? (spentAmount / budget) * 100 : 0;
  const barWidth = Math.min(rawPercent, 100);
  const status = getBudgetStatus(rawPercent);
  const isOver = rawPercent > 100;

  return (
    <button
      type="button"
      onClick={onExpand}
      disabled={!onExpand}
      className={`w-full rounded-xl border bg-[#240046] px-2.5 py-1.5 text-left ${
        isOver ? "budget-card-over" : "border-[#e0aaff1f]"
      } ${onExpand ? "active:scale-[0.99]" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: status.bar }}
        />
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-white">
          {category.name}
        </p>
        <p className="shrink-0 text-[10px] font-semibold" style={{ color: status.text }}>
          {rawPercent.toFixed(0)}%
        </p>
      </div>
      <div
        className="mt-1 h-1 overflow-hidden rounded-full"
        style={{ background: status.track }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${barWidth}%`, background: status.bar }}
        />
      </div>
      <div className="mt-0.5 flex justify-between text-[9px] text-[#9d4edd]">
        <span>
          {formatCompact(spentAmount)}/{formatCompact(budget)}
        </span>
        <span style={{ color: status.text }}>
          {isOver
            ? `${formatCompact(Math.abs(remaining))} over`
            : `${formatCompact(remaining)} left`}
        </span>
      </div>
    </button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { activeCycle, verifyEndCycle, endCycle } = useCycleStore();
  const { categories } = useCategoryStore();
  const { income } = useIncomeStore();
  const { expenses } = useExpenseStore();

  const [endSummary, setEndSummary] = useState(null);
  const [verifyingEnd, setVerifyingEnd] = useState(false);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fuelCategoryName, setFuelCategoryName] = useState("");
  const [trackedSettingsOpen, setTrackedSettingsOpen] = useState(false);
  const [trackedSettingsLoading, setTrackedSettingsLoading] = useState(false);
  const [trackedSettingsSaving, setTrackedSettingsSaving] = useState(false);
  const [includeLeft, setIncludeLeft] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [draftIncludeLeft, setDraftIncludeLeft] = useState(true);
  const [draftCategoryIds, setDraftCategoryIds] = useState([]);

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
  const budgetUsedPct =
    totalBudget > 0 ? Math.min((totalExpense / totalBudget) * 100, 999) : 0;

  const spentByCategory = useMemo(
    () =>
      expenses.reduce((acc, expense) => {
        const key = expense.category_id;
        acc[key] = (acc[key] || 0) + Number(expense.amount);
        return acc;
      }, {}),
    [expenses]
  );

  const loadTrackedSettings = async (cycleId, categoryList) => {
    setTrackedSettingsLoading(true);
    try {
      const response = await getTrackedBalanceSettings(cycleId);
      if (response.success && response.data) {
        setIncludeLeft(Boolean(response.data.includeLeft));
        setSelectedCategoryIds(response.data.categoryIds || []);
        return;
      }
      setIncludeLeft(true);
      setSelectedCategoryIds(categoryList.map((category) => category.id));
    } catch {
      setIncludeLeft(true);
      setSelectedCategoryIds(categoryList.map((category) => category.id));
    } finally {
      setTrackedSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeCycle?.id || categories.length === 0) {
      setSelectedCategoryIds([]);
      setIncludeLeft(true);
      return;
    }
    loadTrackedSettings(activeCycle.id, categories);
  }, [activeCycle?.id, categories.length]);

  const trackedBalance = useMemo(() => {
    const selectedSet = new Set(selectedCategoryIds.map((id) => Number(id)));
    const categoryRemaining = categories.reduce((sum, category) => {
      if (!selectedSet.has(Number(category.id))) return sum;
      const budget = Number(category.budget) || 0;
      const spent = spentByCategory[category.id] || 0;
      return sum + (budget - spent);
    }, 0);
    return categoryRemaining + (includeLeft ? savedAmount : 0);
  }, [
    categories,
    selectedCategoryIds,
    spentByCategory,
    includeLeft,
    savedAmount,
  ]);

  const trackedOver = trackedBalance < 0;

  const { flexibleBudgets, fixedPayments } = useMemo(() => {
    const flexible = [];
    const fixed = [];
    categories.forEach((category) => {
      if (isSimpleExpense(category)) fixed.push(category);
      else flexible.push(category);
    });
    return { flexibleBudgets: flexible, fixedPayments: fixed };
  }, [categories]);

  const fixedPaidCount = fixedPayments.filter((category) => {
    const spent = spentByCategory[category.id] || 0;
    const budget = Number(category.budget) || 0;
    return budget > 0 && spent >= budget;
  }).length;

  const overBudgetCount = flexibleBudgets.filter((category) => {
    const budget = Number(category.budget) || 0;
    const spent = spentByCategory[category.id] || 0;
    return budget > 0 && spent > budget;
  }).length;

  const cashflowPie = useMemo(() => {
    const left = Math.max(totalIncome - totalExpense, 0);
    const items = [
      { name: "Spent", value: totalExpense, fill: "#f97316" },
      { name: "Available", value: left, fill: "#22c55e" },
    ].filter((item) => item.value > 0);

    if (!items.length && totalIncome <= 0) {
      return [{ name: "No income", value: 1, fill: "#5a189a" }];
    }
    return items;
  }, [totalIncome, totalExpense]);

  const remainingPie = useMemo(() => {
    const slices = flexibleBudgets
      .map((category) => {
        const budget = Number(category.budget) || 0;
        const spent = spentByCategory[category.id] || 0;
        const remaining = budget - spent;
        return {
          name: category.name,
          value: remaining,
        };
      })
      .filter((item) => item.value > 0);

    if (savedAmount > 0) {
      slices.push({
        name: "Left",
        value: savedAmount,
        fill: "#eab308",
      });
    }

    return slices.sort((a, b) => b.value - a.value);
  }, [flexibleBudgets, spentByCategory, savedAmount]);

  const stillAvailableTotal = useMemo(
    () => remainingPie.reduce((sum, item) => sum + Number(item.value), 0),
    [remainingPie]
  );

  const priorityBudgets = useMemo(() => {
    return [...flexibleBudgets]
      .sort((a, b) => {
        const pctA =
          Number(a.budget) > 0
            ? (spentByCategory[a.id] || 0) / Number(a.budget)
            : 0;
        const pctB =
          Number(b.budget) > 0
            ? (spentByCategory[b.id] || 0) / Number(b.budget)
            : 0;
        return pctB - pctA;
      })
      .slice(0, 4);
  }, [flexibleBudgets, spentByCategory]);

  const firstName = (session?.name || "there").split(" ")[0];
  const ringPct = Math.min(Math.max(budgetUsedPct, 0), 100);
  const ringStatus = getBudgetStatus(budgetUsedPct);
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset =
    ringCircumference - (ringPct / 100) * ringCircumference;
  const spendShare =
    totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;

  const openTrackedSettings = () => {
    setDraftIncludeLeft(includeLeft);
    setDraftCategoryIds([...selectedCategoryIds]);
    setTrackedSettingsOpen(true);
  };

  const toggleDraftCategory = (categoryId) => {
    setDraftCategoryIds((prev) => {
      const id = Number(categoryId);
      return prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
    });
  };

  const handleSaveTrackedSettings = async () => {
    if (!activeCycle?.id) return;
    try {
      setTrackedSettingsSaving(true);
      const response = await saveTrackedBalanceSettings(activeCycle.id, {
        includeLeft: draftIncludeLeft,
        categoryIds: draftCategoryIds,
      });
      if (!response.success) {
        showToast(
          "error",
          response.message || "Failed to save tracked balance."
        );
        return;
      }
      setIncludeLeft(Boolean(response.data.includeLeft));
      setSelectedCategoryIds(response.data.categoryIds || []);
      setTrackedSettingsOpen(false);
      showToast("success", "Tracked balance updated.");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to save tracked balance."
      );
    } finally {
      setTrackedSettingsSaving(false);
    }
  };

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
      {/* Compact header */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-white">
            Hi, {firstName}
          </h1>
          <p className="truncate text-[10px] text-[#9d4edd]">
            {activeCycle?.cycle_name ||
              activeCycle?.cycleName ||
              "Current cycle"}
            {" · "}
            {budgetUsedPct.toFixed(0)}% budget used
            {overBudgetCount > 0 ? ` · ${overBudgetCount} over` : " · On track"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate("/analysis")}
            className="rounded-full border border-[#3c096c] px-2.5 py-1 text-[10px] text-[#c77dff] transition active:scale-95"
          >
            Charts
          </button>
          <button
            type="button"
            onClick={handleEndCycleClick}
            disabled={verifyingEnd}
            className="rounded-full border border-[#7b2cbf] px-2.5 py-1 text-[10px] text-[#e0aaff] transition active:scale-95 disabled:opacity-50"
          >
            {verifyingEnd ? "..." : "End"}
          </button>
        </div>
      </div>

      {/* Hero + stats */}
      <div className="overflow-hidden rounded-2xl border border-[#e0aaff1f] bg-[#1a0533]">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="relative h-14 w-14 shrink-0">
            <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={ringRadius}
                fill="none"
                stroke="rgba(124, 58, 237, 0.25)"
                strokeWidth="5"
              />
              <circle
                cx="28"
                cy="28"
                r={ringRadius}
                fill="none"
                stroke={ringStatus.bar}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-[11px] font-bold leading-none"
                style={{ color: ringStatus.text }}
              >
                {budgetUsedPct.toFixed(0)}%
              </span>
              <span className="mt-0.5 text-[7px] uppercase tracking-wide text-[#9d4edd]">
                used
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#9d4edd]">
              Balance
            </p>
            <p
              className={`truncate text-[1.7rem] font-bold leading-none tracking-tight ${
                currentBalance < 0 ? "text-[#f87171]" : "text-white"
              }`}
            >
              {formatMoney(currentBalance)}
            </p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#3c096c]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c]"
                style={{ width: `${spendShare}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-[#9d4edd]">
              {formatCompact(totalExpense)} of {formatCompact(totalIncome)}{" "}
              income
            </p>
          </div>
        </div>

        {/* Tracked */}
        <div className="px-2.5 pb-2.5">
          <button
            type="button"
            onClick={openTrackedSettings}
            disabled={trackedSettingsLoading}
            className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition active:scale-[0.99] disabled:opacity-50 ${
              trackedOver
                ? "border-[#f87171]/35 bg-[#450a0a]/50"
                : "border-[#a78bfa]/25 bg-[#2e1065]/55"
            }`}
            aria-label="Configure tracked balance"
          >
            <div className="min-w-0">
              <p
                className={`text-[9px] uppercase tracking-[0.14em] ${
                  trackedOver ? "text-[#fca5a5]" : "text-[#c4b5fd]"
                }`}
              >
                Tracked
              </p>
              <p
                className={`mt-0.5 truncate text-base font-bold leading-none ${
                  trackedOver ? "text-[#fecaca]" : "text-[#ddd6fe]"
                }`}
              >
                {formatMoney(trackedBalance)}
              </p>
            </div>

            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                trackedOver
                  ? "bg-[#f87171]/15 text-[#fca5a5]"
                  : "bg-[#a78bfa]/15 text-[#c4b5fd]"
              }`}
            >
              <FiSettings size={13} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-4 border-t border-[#e0aaff14] bg-[#240046]/80">
          {[
            {
              label: "Income",
              value: totalIncome,
              tone: "text-[#4ade80]",
              dot: "#22c55e",
            },
            {
              label: "Spent",
              value: totalExpense,
              tone: "text-[#fb923c]",
              dot: "#f97316",
            },
            {
              label: "Budget",
              value: totalBudget,
              tone: "text-[#38bdf8]",
              dot: "#0ea5e9",
            },
            {
              label: "Left",
              value: savedAmount,
              tone: savedAmount < 0 ? "text-[#f87171]" : "text-[#eab308]",
              dot: savedAmount < 0 ? "#ef4444" : "#eab308",
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`px-1.5 py-2 text-center ${
                index > 0 ? "border-l border-[#e0aaff14]" : ""
              }`}
            >
              <div className="mb-0.5 flex items-center justify-center gap-1">
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: stat.dot }}
                />
                <p className="text-[8px] text-[#c77dff]">{stat.label}</p>
              </div>
              <p className={`truncate text-[11px] font-semibold ${stat.tone}`}>
                {formatCompact(stat.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Two mini pies side by side */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <MiniDonut
          title="Cash flow"
          data={cashflowPie}
          centerValue={formatCompact(totalIncome)}
        />
        <MiniDonut
          title="Still available"
          data={remainingPie}
          centerValue={formatCompact(stillAvailableTotal)}
        />
      </div>

      {/* Priority budgets — densest useful list */}
      <div className="mt-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-semibold text-white">
            Budgets
            <span className="ml-1 font-normal text-[#9d4edd]">
              top {Math.min(4, flexibleBudgets.length || 0)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="text-[10px] font-medium text-[#c77dff]"
          >
            All →
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-[#e0aaff1f] bg-[#240046] px-3 py-3 text-center text-[11px] text-[#c77dff]">
            No budgets yet
          </div>
        ) : priorityBudgets.length === 0 ? (
          <div className="rounded-xl border border-[#e0aaff1f] bg-[#240046] px-3 py-3 text-center text-[11px] text-[#c77dff]">
            No flexible budgets
          </div>
        ) : (
          <div className="space-y-1.5">
            {priorityBudgets.map((category) => (
              <CompactBudgetRow
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
            ))}
          </div>
        )}
      </div>

      {/* Fixed payments as compact chips */}
      {fixedPayments.length > 0 ? (
        <div className="mt-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-white">
              Fixed
              <span className="ml-1 font-normal text-[#9d4edd]">
                {fixedPaidCount}/{fixedPayments.length}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fixedPayments.map((category) => {
              const spent = spentByCategory[category.id] || 0;
              const budget = Number(category.budget) || 0;
              const paid = budget > 0 && spent >= budget;
              return (
                <span
                  key={category.id}
                  className={`rounded-full border px-2 py-1 text-[10px] ${
                    paid
                      ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]"
                      : "border-[#3c096c] bg-[#240046] text-[#e0aaff]"
                  }`}
                >
                  {paid ? "✓ " : ""}
                  {category.name}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="h-20" />

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

      <TrackedBalanceSettingsModal
        open={trackedSettingsOpen}
        categories={categories}
        includeLeft={draftIncludeLeft}
        selectedCategoryIds={draftCategoryIds}
        saving={trackedSettingsSaving}
        onClose={() => setTrackedSettingsOpen(false)}
        onToggleCategory={toggleDraftCategory}
        onToggleIncludeLeft={() => setDraftIncludeLeft((prev) => !prev)}
        onSelectAll={() =>
          setDraftCategoryIds(categories.map((category) => category.id))
        }
        onClearAll={() => setDraftCategoryIds([])}
        onSave={handleSaveTrackedSettings}
      />
    </ScreenLayout>
  );
};

export default Dashboard;
