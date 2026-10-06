import { useEffect, useMemo, useState } from "react";

import useCycleStore from "../store/cycleStore";
import useCategoryStore from "../store/categoryStore";
import useCategoryTransferStore from "../store/categoryTransferStore";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import PremiumSelect from "../components/PremiumSelect";
import { DeleteAction, EditAction } from "../components/RowActions";
import { showToast } from "../store/toastStore";
import { formatDisplayDate } from "../utils/formatDate";

const emptyForm = (fromId = "", toId = "") => ({
  fromCategoryId: fromId,
  toCategoryId: toId,
  amount: "",
  transferDate: new Date().toISOString().split("T")[0],
  note: "",
});

const toDateInput = (value) => {
  if (!value) return new Date().toISOString().split("T")[0];
  return String(value).slice(0, 10);
};

const formatDayLabel = (value) => formatDisplayDate(value);

const CategoryTransfers = () => {
  const { activeCycle } = useCycleStore();
  const { categories, getCategories } = useCategoryStore();
  const {
    transfers,
    loading,
    getTransfers,
    createTransfer,
    updateTransfer,
    deleteTransfer,
  } = useCategoryTransferStore();

  const [form, setForm] = useState(() => emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeCycle?.id) return;

    getCategories(activeCycle.id);
    getTransfers(activeCycle.id);
  }, [activeCycle]);

  useEffect(() => {
    if (categories.length < 2) return;
    if (form.fromCategoryId && form.toCategoryId) return;

    setForm((prev) => ({
      ...prev,
      fromCategoryId: prev.fromCategoryId || String(categories[0].id),
      toCategoryId:
        prev.toCategoryId || String(categories[1]?.id || categories[0].id),
    }));
  }, [categories, form.fromCategoryId, form.toCategoryId]);

  const totalTransferred = useMemo(() => {
    return transfers.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [transfers]);

  const groupedHistory = useMemo(() => {
    const groups = new Map();

    transfers.forEach((transfer) => {
      const key = toDateInput(transfer.transfer_date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(transfer);
    });

    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      items,
      dayTotal: items.reduce((sum, item) => sum + Number(item.amount), 0),
    }));
  }, [transfers]);

  const resetForm = () => {
    setEditingId(null);
    setForm(
      emptyForm(
        categories[0] ? String(categories[0].id) : "",
        categories[1] ? String(categories[1].id) : ""
      )
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (transfer) => {
    setEditingId(transfer.id);
    setForm({
      fromCategoryId: String(transfer.from_category_id),
      toCategoryId: String(transfer.to_category_id),
      amount: String(Number(transfer.amount)),
      transferDate: toDateInput(transfer.transfer_date),
      note: transfer.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this transfer?");
    if (!confirmed) return;

    const response = await deleteTransfer(id, activeCycle.id);

    if (!response.success) {
      showToast("error", response.message || "Failed to delete transfer.");
      return;
    }

    showToast("success", "Transfer deleted successfully.");
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fromCategoryId || !form.toCategoryId) {
      showToast("error", "Select both categories.");
      return;
    }

    if (form.fromCategoryId === form.toCategoryId) {
      showToast("error", "From and To categories must be different.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      showToast("error", "Amount must be greater than 0.");
      return;
    }

    if (!form.transferDate) {
      showToast("error", "Transfer date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fromCategoryId: Number(form.fromCategoryId),
        toCategoryId: Number(form.toCategoryId),
        amount: Number(form.amount),
        transferDate: form.transferDate,
        note: form.note.trim(),
      };

      let response;

      if (editingId) {
        response = await updateTransfer(
          { id: editingId, ...payload },
          activeCycle.id
        );
      } else {
        response = await createTransfer({
          cycleId: activeCycle.id,
          ...payload,
        });
      }

      if (!response.success) {
        showToast("error", response.message || "Failed to save transfer.");
        return;
      }

      showToast(
        "success",
        editingId
          ? "Transfer updated successfully."
          : "Successfully transferred the balance."
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
        title={editingId ? "Edit Rebalance" : "Rebalance"}
        subtitle={`${transfers.length} moves · ₹${totalTransferred.toLocaleString()} total`}
      />

      {categories.length < 2 ? (
        <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-3 py-4 text-center text-sm text-[#c77dff]">
          Create at least two categories before rebalancing.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3"
        >
          <div className="mb-2.5 grid grid-cols-2 gap-2">
            <PremiumSelect
              label="From"
              value={form.fromCategoryId}
              options={categories.map((category) => ({
                value: String(category.id),
                label: category.name,
                color: category.color || "#7b2cbf",
              }))}
              onChange={(fromCategoryId) =>
                setForm((prev) => ({ ...prev, fromCategoryId }))
              }
            />

            <PremiumSelect
              label="To"
              value={form.toCategoryId}
              options={categories.map((category) => ({
                value: String(category.id),
                label: category.name,
                color: category.color || "#7b2cbf",
              }))}
              onChange={(toCategoryId) =>
                setForm((prev) => ({ ...prev, toCategoryId }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <TextInput
              compact
              label="Amount"
              type="number"
              name="amount"
              placeholder="500"
              value={form.amount}
              onChange={handleChange}
            />
            <TextInput
              compact
              label="Date"
              type="date"
              name="transferDate"
              value={form.transferDate}
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
                  : "+ Transfer"}
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
            {transfers.length} items
          </span>
        </div>

        {loading && transfers.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#c77dff]">Loading...</p>
        ) : transfers.length === 0 ? (
          <p className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] py-4 text-center text-xs text-[#c77dff]">
            No transfers yet.
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
                  {group.items.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          <span
                            className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                            style={{
                              background:
                                transfer.from_category_color || "#7b2cbf",
                            }}
                          />
                          {transfer.from_category_name}
                          <span className="mx-1 text-[#9d4edd]">→</span>
                          <span
                            className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                            style={{
                              background:
                                transfer.to_category_color || "#7b2cbf",
                            }}
                          />
                          {transfer.to_category_name}
                        </p>
                        {transfer.note && (
                          <p className="truncate text-[11px] text-[#9d4edd]">
                            {transfer.note}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-white">
                        ₹{Number(transfer.amount).toLocaleString()}
                      </p>

                      <div className="flex shrink-0 items-center gap-0.5">
                        <EditAction onClick={() => handleEdit(transfer)} />
                        <DeleteAction onClick={() => handleDelete(transfer.id)} />
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

export default CategoryTransfers;
