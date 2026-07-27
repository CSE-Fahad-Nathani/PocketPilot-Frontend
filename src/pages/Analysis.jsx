import { useEffect, useState } from "react";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import SavingEditModal from "../components/SavingEditModal";
import SavingsDistribution from "../components/analysis/SavingsDistribution";
import { DeleteAction, EditAction } from "../components/RowActions";

import useAnalysisStore from "../store/analysisStore";
import useSavingStore from "../store/savingStore";
import { showToast } from "../store/toastStore";

const TABS = [
  { id: "cycles", label: "Cycles" },
  { id: "savings", label: "Savings" },
];

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

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

const Analysis = () => {
  const {
    history,
    analysis,
    selectedCycleId,
    loadingHistory,
    loadingAnalysis,
    getHistory,
    getAnalysis,
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
      }
    };

    init();
  }, []);

  const cycleIncomes = analysis?.incomes || [];
  const cycleCategories = analysis?.categories || [];
  const cycleExpenses = analysis?.expenses || [];
  const cycleSavings = analysis?.savings || [];

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
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {history.map((cycle) => {
                  const isActive = cycle.id === selectedCycleId;

                  return (
                    <button
                      key={cycle.id}
                      type="button"
                      onClick={() => handleSelectCycle(cycle.id)}
                      className={`min-w-[9.5rem] shrink-0 rounded-xl border px-3 py-2.5 text-left transition ${
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

              <section className="mb-4">
                <SectionTitle
                  title="Budgets"
                  count={`${cycleCategories.length} categories`}
                />

                {cycleCategories.length === 0 ? (
                  <EmptyBlock>No categories in this cycle.</EmptyBlock>
                ) : (
                  <LedgerCard>
                    {cycleCategories.map((category) => (
                      <div key={category.id} className="px-3 py-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {category.name}
                            </p>
                            <p className="mt-0.5 text-[10px] capitalize text-[#9d4edd]">
                              {category.type}
                            </p>
                          </div>
                          <p className="shrink-0 text-xs font-semibold text-white">
                            {formatAmount(category.planned_budget)}
                          </p>
                        </div>

                        <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
                          <div>
                            <p className="text-[9px] uppercase tracking-wide text-[#c77dff]">
                              Planned
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-white">
                              {formatAmount(category.planned_budget)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wide text-[#c77dff]">
                              Spent
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-[#facc15]">
                              {formatAmount(category.spent_amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wide text-[#c77dff]">
                              Left
                            </p>
                            <p
                              className={`mt-0.5 text-[11px] font-medium ${
                                Number(category.remaining_amount) < 0
                                  ? "text-[#f87171]"
                                  : "text-[#4ade80]"
                              }`}
                            >
                              {formatAmount(category.remaining_amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </LedgerCard>
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
