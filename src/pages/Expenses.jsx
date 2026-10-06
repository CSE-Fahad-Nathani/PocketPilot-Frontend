import { useEffect, useMemo, useState } from "react";

import useCycleStore from "../store/cycleStore";
import useCategoryStore from "../store/categoryStore";
import useExpenseStore from "../store/expenseStore";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import TextInput from "../components/TextInput";
import SuggestTextInput from "../components/SuggestTextInput";
import PrimaryButton from "../components/PrimaryButton";
import PremiumSelect from "../components/PremiumSelect";
import { DeleteAction, EditAction } from "../components/RowActions";

import {
  buildExtraDataPayload,
  calcFuelDistanceFromLiters,
  calcFuelLitersFromAmount,
  calcFuelMileage,
  emptyExtraData,
  formatExtraDataSummary,
  getExtraDataFields,
  getReasonSuggestions,
  hidesReasonField,
  isFixedPaymentType,
  isSimpleExpense,
  resolveExtraDataType,
} from "../utils/expenseExtraData";
import { showToast } from "../store/toastStore";
import { formatDisplayDate } from "../utils/formatDate";

const emptyForm = (categoryId = "", extraFields = []) => ({
  categoryId,
  amount: "",
  expenseDate: new Date().toISOString().split("T")[0],
  reason: "",
  note: "",
  extraData: emptyExtraData(extraFields),
});

const toDateInput = (value) => {
  if (!value) return new Date().toISOString().split("T")[0];
  return String(value).slice(0, 10);
};

const formatDayLabel = (value) => formatDisplayDate(value);

const Expenses = () => {
  const { activeCycle } = useCycleStore();
  const { categories, getCategories } = useCategoryStore();
  const {
    expenses,
    loading,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenseStore();

  const [form, setForm] = useState(() => emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all");

  useEffect(() => {
    if (!activeCycle?.id) return;

    getCategories(activeCycle.id);
    getExpenses(activeCycle.id);
  }, [activeCycle]);

  useEffect(() => {
    if (!form.categoryId && categories.length > 0) {
      const first = categories[0];
      const fields = getExtraDataFields(first);

      setForm((prev) => ({
        ...prev,
        categoryId: String(first.id),
        amount: isSimpleExpense(first)
          ? String(Number(first.budget) || "")
          : prev.amount,
        extraData: emptyExtraData(fields),
      }));
    }
  }, [categories, form.categoryId]);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) => String(category.id) === String(form.categoryId)
    );
  }, [categories, form.categoryId]);

  const extraFields = useMemo(() => {
    return getExtraDataFields(selectedCategory);
  }, [selectedCategory]);

  const isSimple = isSimpleExpense(selectedCategory);
  const hideReason = hidesReasonField(selectedCategory);
  const isFuelCategory = resolveExtraDataType(selectedCategory) === "fuel";
  const reasonSuggestions = useMemo(
    () => getReasonSuggestions(selectedCategory),
    [selectedCategory]
  );

  const categoryBalance = useMemo(() => {
    if (!selectedCategory) return null;

    const allotted = Number(selectedCategory.budget) || 0;
    const used = expenses.reduce((sum, item) => {
      if (String(item.category_id) !== String(selectedCategory.id)) {
        return sum;
      }

      if (editingId && item.id === editingId) {
        return sum;
      }

      return sum + Number(item.amount);
    }, 0);

    return {
      allotted,
      used,
      remaining: allotted - used,
    };
  }, [selectedCategory, expenses, editingId]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (historyFilter === "all") return expenses;

    return expenses.filter(
      (expense) => String(expense.category_id) === historyFilter
    );
  }, [expenses, historyFilter]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [filteredExpenses]);

  const historyFilterLabel = useMemo(() => {
    if (historyFilter === "all") return "All";
    return (
      categories.find((category) => String(category.id) === historyFilter)
        ?.name || "Category"
    );
  }, [categories, historyFilter]);

  const groupedHistory = useMemo(() => {
    const groups = new Map();

    filteredExpenses.forEach((expense) => {
      const key = toDateInput(expense.expense_date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(expense);
    });

    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      items,
      dayTotal: items.reduce((sum, item) => sum + Number(item.amount), 0),
    }));
  }, [filteredExpenses]);

  const resetForm = () => {
    const category = categories[0];
    const fields = getExtraDataFields(category);

    setEditingId(null);
    setForm({
      ...emptyForm(category ? String(category.id) : "", fields),
      amount: isSimpleExpense(category)
        ? String(Number(category.budget) || "")
        : "",
    });
  };

  const handleCategoryChange = (value) => {
    const category = categories.find(
      (item) => String(item.id) === String(value)
    );
    const fields = getExtraDataFields(category);
    const extraData = emptyExtraData(fields);
    const isFuel = resolveExtraDataType(category) === "fuel";

    setForm((prev) => {
      const nextAmount = isSimpleExpense(category)
        ? String(Number(category?.budget) || "")
        : prev.amount;

      if (isFuel && nextAmount) {
        const liters = calcFuelLitersFromAmount(nextAmount);
        const distance = calcFuelDistanceFromLiters(liters);
        extraData.liters = liters;
        extraData.distance = distance;
        extraData.mileage = calcFuelMileage(distance, liters);
      }

      return {
        ...prev,
        categoryId: value,
        reason: "",
        amount: nextAmount,
        extraData,
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount" && isFuelCategory) {
      const liters = calcFuelLitersFromAmount(value);
      const distance = calcFuelDistanceFromLiters(liters);

      setForm((prev) => ({
        ...prev,
        amount: value,
        extraData: {
          ...prev.extraData,
          liters,
          distance,
          mileage: calcFuelMileage(distance, liters),
        },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const nextExtra = {
        ...prev.extraData,
        [name]: value,
      };

      if (name === "distance" || name === "liters") {
        nextExtra.mileage = calcFuelMileage(
          name === "distance" ? value : nextExtra.distance,
          name === "liters" ? value : nextExtra.liters
        );
      }

      return {
        ...prev,
        extraData: nextExtra,
      };
    });
  };

  const handleEdit = (expense) => {
    const category = categories.find(
      (item) => String(item.id) === String(expense.category_id)
    );
    const fields = getExtraDataFields(category);
    const stored = expense.extra_data || {};

    const extraData = emptyExtraData(fields);
    fields.forEach((field) => {
      if (stored[field.key] !== undefined && stored[field.key] !== null) {
        extraData[field.key] = String(stored[field.key]);
      }
    });

    setEditingId(expense.id);
    setForm({
      categoryId: String(expense.category_id),
      amount: String(Number(expense.amount)),
      expenseDate: toDateInput(expense.expense_date),
      reason: expense.reason || "",
      note: expense.note || "",
      extraData,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this expense?");
    if (!confirmed) return;

    const response = await deleteExpense(id, activeCycle.id);

    if (!response.success) {
      showToast("error", response.message || "Failed to delete expense.");
      return;
    }

    showToast("success", "Expense deleted successfully.");
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId) {
      showToast("error", "Please select a category.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      showToast("error", "Amount must be greater than 0.");
      return;
    }

    const reason = hideReason
      ? selectedCategory?.name || "Expense"
      : form.reason.trim();

    if (!hideReason && !reason) {
      showToast("error", "Reason is required.");
      return;
    }

    if (!form.expenseDate) {
      showToast("error", "Expense date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        categoryId: Number(form.categoryId),
        expenseDate: form.expenseDate,
        amount: Number(form.amount),
        reason,
        note: form.note.trim(),
        extraData: buildExtraDataPayload(extraFields, form.extraData),
      };

      let response;

      if (editingId) {
        response = await updateExpense(
          { id: editingId, ...payload },
          activeCycle.id
        );
      } else {
        response = await createExpense({
          cycleId: activeCycle.id,
          ...payload,
        });
      }

      if (!response.success) {
        showToast("error", response.message || "Failed to save expense.");
        return;
      }

      showToast(
        "success",
        editingId
          ? "Expense updated successfully."
          : "Successfully added the expense."
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
        title={editingId ? "Edit Expense" : "Add Expense"}
        subtitle={`${expenses.length} entries · ₹${totalExpense.toLocaleString()} total`}
      />

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-3 py-4 text-center text-sm text-[#c77dff]">
          Create a category first before adding expenses.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3"
        >
          <PremiumSelect
            className="mb-2.5"
            label="Category"
            value={form.categoryId}
            options={categories.map((category) => ({
              value: String(category.id),
              label: category.name,
              color: category.color || "#7b2cbf",
              badge: isFixedPaymentType(category.type) ? "Paid" : "Flex",
            }))}
            onChange={handleCategoryChange}
          />

          {categoryBalance && (
            <div className="mb-2.5 grid grid-cols-3 gap-1 rounded-xl bg-[#3c096c]/50 px-2 py-2">
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-wide text-[#c77dff]">
                  Allotted
                </p>
                <p className="mt-0.5 text-xs font-semibold text-white">
                  ₹{categoryBalance.allotted.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-wide text-[#c77dff]">
                  Used
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#facc15]">
                  ₹{categoryBalance.used.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-wide text-[#c77dff]">
                  Left
                </p>
                <p
                  className={`mt-0.5 text-xs font-semibold ${
                    categoryBalance.remaining < 0
                      ? "text-[#f87171]"
                      : "text-[#4ade80]"
                  }`}
                >
                  ₹{categoryBalance.remaining.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <TextInput
              compact
              label={isSimple ? "Payment" : "Amount"}
              type="number"
              name="amount"
              placeholder="350"
              value={form.amount}
              onChange={handleChange}
            />
            <TextInput
              compact
              label="Date"
              type="date"
              name="expenseDate"
              value={form.expenseDate}
              onChange={handleChange}
            />
          </div>

          {!hideReason && (
            reasonSuggestions.length > 0 ? (
              <SuggestTextInput
                className="mb-2.5"
                compact
                label="Reason"
                name="reason"
                placeholder="Select or type"
                value={form.reason}
                onChange={handleChange}
                suggestions={reasonSuggestions}
              />
            ) : (
              <TextInput
                compact
                label="Reason"
                name="reason"
                placeholder="Petrol"
                value={form.reason}
                onChange={handleChange}
              />
            )
          )}

          {extraFields.length > 0 && (
            <div className="mb-2.5 rounded-xl border border-[#5a189a]/60 bg-[#3c096c]/30 p-2.5">
              <p className="mb-2 text-[11px] font-medium text-[#e0aaff]">
                {selectedCategory?.name} details
              </p>
              <div className="grid grid-cols-2 gap-2">
                {extraFields.map((field) => (
                  <TextInput
                    key={field.key}
                    compact
                    label={field.label}
                    type={field.type}
                    name={field.key}
                    placeholder={field.placeholder}
                    value={form.extraData?.[field.key] ?? ""}
                    onChange={handleExtraChange}
                    disabled={Boolean(field.readOnly || field.computed)}
                  />
                ))}
              </div>
            </div>
          )}

          {!isSimple && (
            <TextInput
              compact
              label="Note"
              name="note"
              placeholder="Optional"
              value={form.note}
              onChange={handleChange}
            />
          )}

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
      )}

      <div className="mt-4 mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#e0aaff]">History</h3>
          <span className="text-[11px] text-[#9d4edd]">
            {filteredExpenses.length} items
            {historyFilter !== "all" ? ` · ₹${filteredTotal.toLocaleString()}` : ""}
          </span>
        </div>

        {categories.length > 0 ? (
          <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 theme-scrollbar-x">
            <button
              type="button"
              onClick={() => setHistoryFilter("all")}
              className={`shrink-0 rounded-full mb-2 border px-3 py-1.5 text-[11px] font-medium transition ${
                historyFilter === "all"
                  ? "border-[#9d4edd] bg-[#5a189a]/50 text-white"
                  : "border-[#3c096c] bg-[#3c096c]/30 text-[#c77dff] hover:bg-[#3c096c]/50"
              }`}
            >
              All
            </button>
            {categories.map((category) => {
              const active = historyFilter === String(category.id);

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setHistoryFilter(String(category.id))}
                  className={`shrink-0 mb-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                    active
                      ? "border-[#9d4edd] bg-[#5a189a]/50 text-white"
                      : "border-[#3c096c] bg-[#3c096c]/30 text-[#c77dff] hover:bg-[#3c096c]/50"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: category.color || "#7b2cbf" }}
                    />
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {loading && expenses.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#c77dff]">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] py-4 text-center text-xs text-[#c77dff]">
            No expenses yet.
          </p>
        ) : filteredExpenses.length === 0 ? (
          <p className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] py-4 text-center text-xs text-[#c77dff]">
            No expenses for {historyFilterLabel}.
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
                  {group.items.map((expense) => {
                    const extraLines = formatExtraDataSummary(
                      expense.extra_data
                    );
                    const title =
                      expense.reason === expense.category_name
                        ? expense.category_name
                        : expense.reason;

                    return (
                      <div
                        key={expense.id}
                        className="flex items-center gap-2 px-3 py-2"
                      >
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background: expense.color || "#7b2cbf",
                          }}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {title}
                          </p>
                          <p className="truncate text-[11px] text-[#9d4edd]">
                            {expense.category_name}
                            {expense.note ? ` · ${expense.note}` : ""}
                            {extraLines[0] ? ` · ${extraLines[0]}` : ""}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-white">
                          ₹{Number(expense.amount).toLocaleString()}
                        </p>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <EditAction onClick={() => handleEdit(expense)} />
                          <DeleteAction onClick={() => handleDelete(expense.id)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScreenLayout>
  );
};

export default Expenses;
