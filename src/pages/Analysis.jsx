import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import SavingEditModal from "../components/SavingEditModal";
import SavingsDistribution from "../components/analysis/SavingsDistribution";
import FuelMileageChart from "../components/FuelMileageChart";
import { DeleteAction, EditAction } from "../components/RowActions";

import useAnalysisStore from "../store/analysisStore";
import useSavingStore from "../store/savingStore";
import { showToast } from "../store/toastStore";
import { getBudgetStatus } from "../utils/budgetStatus";
import { isSimpleExpense } from "../utils/expenseExtraData";
import { formatDisplayDate } from "../utils/formatDate";

const TABS = [
  { id: "cycles", label: "Cycles" },
  { id: "savings", label: "Savings" },
];

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDate = (value) => formatDisplayDate(value);

const SummaryRow = ({ label, value, emphasize = false }) => (
  <div className="flex items-center justify-between gap-3 py-1.5">
    <span className="text-[11px] text-[#c77dff]">{label}</span>
    <span
      className={`text-sm font-semibold ${
        emphasize ? "text-[#4ade80]" : "text-white"
      }`}
    >
      {formatAmount(value)}
    </span>
  </div>
);

const EmptyBlock = ({ children }) => (
  <p className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] py-4 text-center text-xs text-[#c77dff]">
    {children}
  </p>
);

const SectionTitle = ({ title, count }) => (
  <div className="mb-2 flex items-center justify-between">
    <h3 className="text-sm font-semibold text-[#e0aaff]">{title}</h3>
    {count !== undefined && (
      <span className="text-[11px] text-[#9d4edd]">{count}</span>
    )}
  </div>
);

const LedgerCard = ({ children }) => (
  <div className="overflow-hidden rounded-2xl border border-[#e0aaff1f] bg-[#240046] divide-y divide-[#3c096c]">
    {children}
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3">
    <div className="mb-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle ? (
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">{subtitle}</p>
      ) : null}
    </div>
    {children}
  </div>
);

const chartPalette = [
  "#06b6d4",
  "#3b82f6",
  "#14b8a6",
  "#22c55e",
  "#4ade80",
  "#f59e0b",
  "#f87171",
  "#eab308",
];

const formatCompactAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";

  return `₹${new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/95 px-3 py-2 shadow-lg">
      {label ? <p className="text-xs font-medium text-white">{label}</p> : null}
      <div className="mt-1 space-y-1">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-3 text-[11px]"
          >
            <span style={{ color: item.color }} className="font-medium">
              {item.name}
            </span>
            <span className="text-white">{formatAmount(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisTabs = ({ active, onChange }) => (
  <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-[#e0aaff1f] bg-[#240046] p-1">
    {TABS.map((tab) => {
      const isActive = tab.id === active;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
            isActive
              ? "bg-[#5a189a] text-white shadow-sm"
              : "text-[#c77dff] hover:bg-[#3c096c]/60"
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </div>
);

const FinancialOverviewChart = ({ analysis }) => {
  const data = [
    {
      name: "Plan",
      amount: Number(analysis.planned_budget || 0),
      fill: "#06b6d4",
    },
    {
      name: "Income",
      amount: Number(analysis.total_income || 0),
      fill: "#22c55e",
    },
    {
      name: "Spend",
      amount: Number(analysis.total_expense || 0),
      fill: "#f97316",
    },
    {
      name: "Saved",
      amount: Number(analysis.total_saved || 0),
      fill: "#eab308",
    },
  ];

  return (
    <ChartCard title="Overview" subtitle="Cycle totals">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3c096c" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#c77dff", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#9d4edd", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={formatCompactAmount}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const CategoryComparisonChart = ({ categories }) => {
  const data = categories
    .filter((category) => !isSimpleExpense(category))
    .map((category) => ({
      name: category.name,
      planned: Number(category.planned_budget || 0),
      spent: Number(category.spent_amount || 0),
    }))
    .sort((a, b) => b.spent - a.spent);

  if (!data.length) return null;

  return (
    <ChartCard title="Spend vs Budget" subtitle="Variable budgets">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 4, right: 0, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3c096c" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#c77dff", fontSize: 8 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#9d4edd", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={formatCompactAmount}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
            <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
            <Bar dataKey="planned" name="Planned" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

const ExpenseSplitChart = ({ categories }) => {
  const data = categories
    .map((category) => ({
      name: category.name,
      value: Number(category.spent_amount || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (!data.length) return null;

  return (
    <ChartCard
      title="Expense Split"
      subtitle="Where most spending happened"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartPalette[index % chartPalette.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#3c096c] bg-[#3c096c]/25 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                />
                <span className="truncate text-xs text-white">{item.name}</span>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-[#c77dff]">
                {formatAmount(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

const Analysis = () => {
  const {
    history,
    analysis,
    selectedCycleId,
    loadingHistory,
    loadingAnalysis,
    getHistory,
    getAnalysis,
    clearAnalysis,
  } = useAnalysisStore();

  const { savings, loading: loadingSavings, getSavings, deleteSaving } =
    useSavingStore();

  const [tab, setTab] = useState("cycles");
  const [editingSavingId, setEditingSavingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const historyResponse = await getHistory();
      await getSavings();

      if (historyResponse.success && historyResponse.data?.length) {
        await getAnalysis(historyResponse.data[0].id);
      } else {
        clearAnalysis();
      }
    };

    init();
  }, []);

  const cycleIncomes = analysis?.incomes || [];
  const cycleCategories = analysis?.categories || [];
  const cycleExpenses = analysis?.expenses || [];
  const cycleSavings = analysis?.savings || [];
  const fuelAnalysis = analysis?.fuel_analysis;
  const hasFuelHistory = (fuelAnalysis?.history?.length || 0) > 0;
  const totalSpentCategories = useMemo(
    () =>
      cycleCategories.filter((item) => Number(item.spent_amount || 0) > 0).length,
    [cycleCategories]
  );

  const handleSelectCycle = async (cycleId) => {
    if (cycleId === selectedCycleId) return;

    const response = await getAnalysis(cycleId);
    if (!response.success) {
      showToast("error", response.message || "Failed to load analysis.");
    }
  };

  const refreshAfterSavingChange = async () => {
    await getSavings();
    if (selectedCycleId) {
      await getAnalysis(selectedCycleId);
    }
  };

  const handleDeleteSaving = async (id) => {
    const confirmed = window.confirm("Delete this saving transaction?");
    if (!confirmed) return;

    const response = await deleteSaving(id);
    if (!response.success) {
      showToast("error", response.message || "Failed to delete saving.");
      return;
    }

    showToast("success", "Saving deleted successfully.");
    if (selectedCycleId) {
      await getAnalysis(selectedCycleId);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader
        compact
        title="Analysis"
        subtitle="Past cycles & savings"
      />

      <AnalysisTabs active={tab} onChange={setTab} />

      {tab === "cycles" && (
        <>
          <section className="mb-4">
            <SectionTitle title="Cycles" count={`${history.length} completed`} />

            {loadingHistory ? (
              <EmptyBlock>Loading cycles...</EmptyBlock>
            ) : history.length === 0 ? (
              <EmptyBlock>
                No completed cycles yet. End a cycle to see analysis here.
              </EmptyBlock>
            ) : (
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 theme-scrollbar-x">
                {history.map((cycle) => {
                  const isActive = cycle.id === selectedCycleId;

                  return (
                    <button
                      key={cycle.id}
                      type="button"
                      onClick={() => handleSelectCycle(cycle.id)}
                      className={`min-w-[9.5rem] mb-2 shrink-0 rounded-xl border px-3 py-2.5 text-left transition ${
                        isActive
                          ? "border-[#9d4edd] bg-[#5a189a]/50"
                          : "border-[#e0aaff1f] bg-[#240046] hover:border-[#7b2cbf]/60"
                      }`}
                    >
                      <p className="truncate text-sm font-medium text-white">
                        {cycle.cycle_name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                        {formatDate(cycle.start_date)} –{" "}
                        {formatDate(cycle.end_date)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#4ade80]">
                        Saved {formatAmount(cycle.total_saved)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {loadingAnalysis ? (
            <EmptyBlock>Loading cycle analysis...</EmptyBlock>
          ) : !analysis ? (
            <EmptyBlock>Select a cycle to view its analysis.</EmptyBlock>
          ) : (
            <>
              <section className="mb-4">
                <SectionTitle title="Cycle summary" />
                <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3">
                  <div className="mb-2">
                    <p className="text-base font-semibold text-white">
                      {analysis.cycle_name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9d4edd]">
                      {formatDate(analysis.start_date)} –{" "}
                      {formatDate(analysis.end_date)}
                    </p>
                  </div>

                  <div className="divide-y divide-[#3c096c] rounded-xl border border-[#3c096c] bg-[#3c096c]/40 px-3">
                    <SummaryRow
                      label="Planned Budget"
                      value={analysis.planned_budget}
                    />
                    <SummaryRow
                      label="Total Income"
                      value={analysis.total_income}
                    />
                    <SummaryRow
                      label="Total Expense"
                      value={analysis.total_expense}
                    />
                    <SummaryRow
                      label="Total Saved"
                      value={analysis.total_saved}
                      emphasize
                    />
                  </div>
                </div>
              </section>

              <section className="mb-4 space-y-4">
                <SectionTitle title="Visual Insights" />
                {hasFuelHistory ? (
                  <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3">
                    <FuelMileageChart fuelAnalysis={fuelAnalysis} />
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-3 [&>*:only-child]:col-span-2">
                  <FinancialOverviewChart analysis={analysis} />
                  <CategoryComparisonChart categories={cycleCategories} />
                </div>
                {totalSpentCategories > 0 ? (
                  <ExpenseSplitChart categories={cycleCategories} />
                ) : null}
              </section>

              <section className="mb-4">
                <SectionTitle
                  title="Budgets"
                  count={`${cycleCategories.length} categories`}
                />

                {cycleCategories.length === 0 ? (
                  <EmptyBlock>No categories in this cycle.</EmptyBlock>
                ) : (
                  <div className="space-y-2">
                    {cycleCategories.map((category) => {
                      const planned = Number(category.planned_budget || 0);
                      const spent = Number(category.spent_amount || 0);
                      const remaining = Number(category.remaining_amount || 0);
                      const rawPercent =
                        planned > 0 ? (spent / planned) * 100 : 0;
                      const barWidth = Math.min(rawPercent, 100);
                      const status = getBudgetStatus(rawPercent);
                      const overBudget = rawPercent > 100;

                      return (
                        <div
                          key={category.id}
                          className={`rounded-xl border bg-[#240046] px-2.5 py-2 ${
                            overBudget ? "budget-card-over" : "border-[#e0aaff1f]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ background: status.bar }}
                                />
                                <p className="truncate text-sm font-semibold text-white">
                                  {category.name}
                                </p>
                                <span className="rounded-full border border-[#3c096c] bg-[#3c096c]/35 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.14em] text-[#c77dff]">
                                  {category.type}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                                <span className="text-[#9d4edd]">
                                  Planned{" "}
                                  <span className="text-white">
                                    {formatAmount(planned)}
                                  </span>
                                </span>
                                <span className="text-[#9d4edd]">
                                  Spent{" "}
                                  <span className="text-white">
                                    {formatAmount(spent)}
                                  </span>
                                </span>
                                <span style={{ color: status.text }}>
                                  {overBudget
                                    ? `${formatAmount(Math.abs(remaining))} over`
                                    : `${formatAmount(remaining)} left`}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p
                                className="text-[10px] font-semibold"
                                style={{ color: status.text }}
                              >
                                {rawPercent.toFixed(0)}%
                              </p>
                            </div>
                          </div>

                          <div className="mt-1.5">
                            <div
                              className="h-1 overflow-hidden rounded-full"
                              style={{ background: status.track }}
                            >
                              <div
                                className="h-full rounded-full transition-[width,background-color] duration-300 ease-out"
                                style={{
                                  width: `${barWidth}%`,
                                  background: status.bar,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="mb-4">
                <SectionTitle
                  title="Income"
                  count={`${cycleIncomes.length} entries`}
                />

                {cycleIncomes.length === 0 ? (
                  <EmptyBlock>No income in this cycle.</EmptyBlock>
                ) : (
                  <LedgerCard>
                    {cycleIncomes.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {item.type}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                            {formatDate(item.income_date)}
                          </p>
                          {item.note ? (
                            <p className="mt-0.5 truncate text-[10px] text-[#c77dff]">
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#4ade80]">
                          +{formatAmount(item.amount)}
                        </p>
                      </div>
                    ))}
                  </LedgerCard>
                )}
              </section>

              <section className="mb-4">
                <SectionTitle
                  title="Expenses"
                  count={`${cycleExpenses.length} entries`}
                />

                {cycleExpenses.length === 0 ? (
                  <EmptyBlock>No expenses in this cycle.</EmptyBlock>
                ) : (
                  <LedgerCard>
                    {cycleExpenses.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {item.reason || item.category_name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                            {item.category_name} ·{" "}
                            {formatDate(item.expense_date)}
                          </p>
                          {item.note ? (
                            <p className="mt-0.5 truncate text-[10px] text-[#c77dff]">
                              {item.note}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-orange-300">
                          −{formatAmount(item.amount)}
                        </p>
                      </div>
                    ))}
                  </LedgerCard>
                )}
              </section>

              <section className="mb-8">
                <SectionTitle
                  title="Cycle savings"
                  count={`${cycleSavings.length} entries`}
                />

                {cycleSavings.length === 0 ? (
                  <EmptyBlock>No savings linked to this cycle.</EmptyBlock>
                ) : (
                  <LedgerCard>
                    {cycleSavings.map((item) => {
                      const isWithdrawal =
                        String(item.type).toUpperCase() === "WITHDRAWAL";

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 px-3 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded border px-1 py-px text-[8px] font-medium uppercase tracking-wide ${
                                  isWithdrawal
                                    ? "border-orange-400/30 bg-orange-400/10 text-orange-200"
                                    : "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#86efac]"
                                }`}
                              >
                                {isWithdrawal ? "Out" : "In"}
                              </span>
                              <p className="truncate text-sm font-medium text-white">
                                {item.title}
                              </p>
                            </div>
                            <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                              {formatDate(item.transaction_date)}
                              {item.bucket_name
                                ? ` · ${item.bucket_name}`
                                : ""}
                            </p>
                            {item.note ? (
                              <p className="mt-0.5 truncate text-[10px] text-[#c77dff]">
                                {item.note}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <p
                              className={`text-sm font-semibold ${
                                isWithdrawal
                                  ? "text-orange-300"
                                  : "text-[#4ade80]"
                              }`}
                            >
                              {isWithdrawal ? "−" : "+"}
                              {formatAmount(item.amount)}
                            </p>
                            <div className="flex items-center gap-0.5">
                              <EditAction
                                onClick={() => setEditingSavingId(item.id)}
                              />
                              <DeleteAction
                                onClick={() => handleDeleteSaving(item.id)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </LedgerCard>
                )}
              </section>
            </>
          )}
        </>
      )}

      {tab === "savings" && (
        <>
          <SavingsDistribution />

          <section className="mb-8">
            <SectionTitle
              title="All savings"
              count={`${savings.length} total`}
            />

            {loadingSavings ? (
              <EmptyBlock>Loading savings...</EmptyBlock>
            ) : savings.length === 0 ? (
              <EmptyBlock>
                No savings yet. They appear automatically when you end a cycle.
              </EmptyBlock>
            ) : (
              <LedgerCard>
                {savings.map((item) => {
                  const isWithdrawal =
                    String(item.type).toUpperCase() === "WITHDRAWAL";

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded border px-1 py-px text-[8px] font-medium uppercase tracking-wide ${
                              isWithdrawal
                                ? "border-orange-400/30 bg-orange-400/10 text-orange-200"
                                : "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#86efac]"
                            }`}
                          >
                            {isWithdrawal ? "Out" : "In"}
                          </span>
                          <p className="truncate text-sm font-medium text-white">
                            {item.title}
                          </p>
                        </div>

                        <p className="mt-0.5 text-[10px] text-[#9d4edd]">
                          {formatDate(item.transaction_date)}
                          {item.bucket_name ? ` · ${item.bucket_name}` : ""}
                        </p>

                        {item.note ? (
                          <p className="mt-0.5 truncate text-[10px] text-[#c77dff]">
                            {item.note}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p
                          className={`text-sm font-semibold ${
                            isWithdrawal ? "text-orange-300" : "text-[#4ade80]"
                          }`}
                        >
                          {isWithdrawal ? "−" : "+"}
                          {formatAmount(item.amount)}
                        </p>
                        <div className="flex items-center gap-0.5">
                          <EditAction
                            onClick={() => setEditingSavingId(item.id)}
                          />
                          <DeleteAction
                            onClick={() => handleDeleteSaving(item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </LedgerCard>
            )}
          </section>
        </>
      )}

      <SavingEditModal
        open={Boolean(editingSavingId)}
        savingId={editingSavingId}
        onClose={() => setEditingSavingId(null)}
        onSaved={refreshAfterSavingChange}
      />
    </ScreenLayout>
  );
};

export default Analysis;
