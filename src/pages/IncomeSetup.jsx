import { useEffect, useMemo, useState } from "react";

import useCycleStore from "../store/cycleStore";
import useIncomeStore from "../store/incomeStore";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import PremiumSelect from "../components/PremiumSelect";
import { DeleteAction, EditAction } from "../components/RowActions";
import { showToast } from "../store/toastStore";

const INCOME_TYPES = [
  "Salary",
  "Bonus",
  "Gift",
  "Refund",
  "Cash",
  "Other",
];

const emptyForm = () => ({
  type: "Salary",
  amount: "",
  incomeDate: new Date().toISOString().split("T")[0],
  note: "",
});

const toDateInput = (value) => {
  if (!value) return new Date().toISOString().split("T")[0];
  return String(value).slice(0, 10);
};

const formatDayLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return toDateInput(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getIncomeDate = (item) => item.income_date || item.incomeDate;

const IncomeSetup = () => {
  const { activeCycle } = useCycleStore();

  const {
    income,
    loading,
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
  } = useIncomeStore();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeCycle?.id) {
      getIncome(activeCycle.id);
    }
  }, [activeCycle]);

  const totalIncome = useMemo(() => {
    return income.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [income]);

  const groupedHistory = useMemo(() => {
    const groups = new Map();

    income.forEach((item) => {
      const key = toDateInput(getIncomeDate(item));
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      items,
      dayTotal: items.reduce((sum, item) => sum + Number(item.amount), 0),
    }));
  }, [income]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      type: item.type || "Salary",
      amount: String(Number(item.amount)),
      incomeDate: toDateInput(getIncomeDate(item)),
      note: item.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this income entry?");
    if (!confirmed) return;

    const response = await deleteIncome(id, activeCycle.id);

    if (response && response.success === false) {
      showToast("error", response.message || "Failed to delete income.");
      return;
    }

    showToast("success", "Income deleted successfully.");
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      showToast("error", "Amount must be greater than 0.");
      return;
    }

    if (!form.incomeDate) {
      showToast("error", "Date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: form.type,
        amount: Number(form.amount),
        incomeDate: form.incomeDate,
        note: form.note.trim(),
      };

      let response;

      if (editingId) {
        response = await updateIncome({
          id: editingId,
          cycleId: activeCycle.id,
          ...payload,
        });
      } else {
        response = await createIncome({
          cycleId: activeCycle.id,
          ...payload,
        });
      }

      if (response && response.success === false) {
        showToast("error", response.message || "Failed to save income.");
        return;
      }

      showToast(
        "success",
        editingId
          ? "Income updated successfully."
          : "Successfully added the income."
      );
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader
        compact
        title={editingId ? "Edit Income" : "Add Income"}
        subtitle={`${income.length} entries · ₹${totalIncome.toLocaleString()} total`}
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3"
      >
        <PremiumSelect
          className="mb-2.5"
          label="Type"
          value={form.type}
          options={INCOME_TYPES.map((type) => ({
            value: type,
            label: type,
          }))}
          onChange={(type) => setForm((prev) => ({ ...prev, type }))}
        />

        <div className="grid grid-cols-2 gap-2">
          <TextInput
            compact
            label="Amount"
            type="number"
            name="amount"
            placeholder="50000"
            value={form.amount}
            onChange={handleChange}
          />
          <TextInput
            compact
            label="Date"
            type="date"
            name="incomeDate"
            value={form.incomeDate}
            onChange={handleChange}
          />
        </div>

        <TextInput
          compact
          label="Note"
          name="note"
          placeholder="Optional"
          value={form.note}
          onChange={handleChange}
        />

        <div className="mt-1 flex gap-2">
          <PrimaryButton compact type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update"
                : "+ Add"}
          </PrimaryButton>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="shrink-0 rounded-xl border border-[#7b2cbf] px-4 text-sm text-[#c77dff]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#e0aaff]">History</h3>
          <span className="text-[11px] text-[#9d4edd]">
            {income.length} items
          </span>
        </div>

        {loading && income.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#c77dff]">Loading...</p>
        ) : income.length === 0 ? (
          <p className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] py-4 text-center text-xs text-[#c77dff]">
            No income yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e0aaff1f] bg-[#240046]">
            {groupedHistory.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-between bg-[#3c096c]/70 px-3 py-1.5">
                  <span className="text-[11px] font-medium text-[#e0aaff]">
                    {formatDayLabel(group.date)}
                  </span>
                  <span className="text-[11px] text-[#c77dff]">
                    ₹{group.dayTotal.toLocaleString()}
                  </span>
                </div>

                <div className="divide-y divide-[#3c096c]">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#4ade80]" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.type}
                        </p>
                        <p className="truncate text-[11px] text-[#9d4edd]">
                          {item.note || "No note"}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-white">
                        ₹{Number(item.amount).toLocaleString()}
                      </p>

                      <div className="flex shrink-0 items-center gap-0.5">
                        <EditAction onClick={() => handleEdit(item)} />
                        <DeleteAction onClick={() => handleDelete(item.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenLayout>
  );
};

export default IncomeSetup;
