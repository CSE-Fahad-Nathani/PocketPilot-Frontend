import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useCycleStore from "../store/cycleStore";
import useCategoryStore from "../store/categoryStore";
import * as cycleService from "../services/cycleService";
import categoryService from "../services/categoryService";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import TextInput from "../components/TextInput";
import SuggestTextInput from "../components/SuggestTextInput";
import PrimaryButton from "../components/PrimaryButton";
import CategoryTypeSelect, { FlowBadge } from "../components/CategoryTypeSelect";
import { ArchiveAction, EditAction } from "../components/RowActions";
import ImportBudgetsModal from "../components/ImportBudgetsModal";
import {
  isFixedPaymentType,
} from "../utils/expenseExtraData";
import { showToast } from "../store/toastStore";

const CATEGORY_NAME_SUGGESTIONS = [
  "Personal",
  "Fuel",
  "SIP",
  "EMI",
  "Education Loan",
  "Rent",
  "Bills",
  "Gym",
];

const NAME_TYPE_HINTS = [
  { match: /fuel/i, type: "fuel" },
  { match: /sip/i, type: "sip" },
  { match: /emi|loan/i, type: "emi" },
  { match: /rent|bill/i, type: "bills" },
  { match: /gym|subscription/i, type: "subscription" },
  { match: /personal/i, type: "default" },
];

const CATEGORY_TYPES = [
  { label: "Personal", value: "default", flow: "flexible" },
  { label: "Fuel", value: "fuel", flow: "flexible" },
  { label: "Custom", value: "custom", flow: "flexible" },
  { label: "EMI", value: "emi", flow: "fixed" },
  { label: "SIP", value: "sip", flow: "fixed" },
  { label: "Subscription", value: "subscription", flow: "fixed" },
  { label: "Bills", value: "bills", flow: "fixed" },
];

const emptyForm = () => ({
  name: "",
  type: "default",
  budget: "",
  icon: "",
  color: "#7b2cbf",
});

const CategorySetup = () => {
  const navigate = useNavigate();
  const { activeCycle } = useCycleStore();

  const {
    categories,
    loading,
    getCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    importCategoriesFromCycle,
  } = useCategoryStore();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [previousCycle, setPreviousCycle] = useState(null);
  const [sourceCategories, setSourceCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (activeCycle?.id) {
      getCategories(activeCycle.id);
    }
  }, [activeCycle]);

  useEffect(() => {
    const loadPrevious = async () => {
      try {
        const response = await cycleService.getCycleHistory();
        const latest = response.success ? response.data?.[0] : null;
        setPreviousCycle(latest || null);
      } catch {
        setPreviousCycle(null);
      }
    };

    loadPrevious();
  }, []);

  const openImportModal = async () => {
    if (!previousCycle?.id) {
      showToast("info", "No previous cycle found to import from.");
      return;
    }

    setImportOpen(true);
    setLoadingSource(true);

    try {
      const response = await categoryService.getCategories(previousCycle.id);

      if (response.success && response.data?.length) {
        setSourceCategories(response.data);
        setSelectedIds(response.data.map((item) => item.id));
      } else {
        setSourceCategories([]);
        setSelectedIds([]);
      }
    } catch {
      setSourceCategories([]);
      setSelectedIds([]);
      showToast("error", "Failed to load previous budgets.");
    } finally {
      setLoadingSource(false);
    }
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmImport = async () => {
    if (!activeCycle?.id || !previousCycle?.id || !selectedIds.length) return;

    try {
      setImporting(true);

      const response = await importCategoriesFromCycle({
        targetCycleId: activeCycle.id,
        sourceCycleId: previousCycle.id,
        categoryIds: selectedIds,
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to import budgets.");
        return;
      }

      setImportOpen(false);
      showToast(
        "success",
        response.message ||
          `${response.data.importedCount} budgets imported.`
      );
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to import budgets."
      );
    } finally {
      setImporting(false);
    }
  };

  const totalBudget = useMemo(() => {
    return categories.reduce((sum, item) => sum + Number(item.budget), 0);
  }, [categories]);

  const selectedTypeMeta = useMemo(() => {
    return (
      CATEGORY_TYPES.find((item) => item.value === form.type) ||
      CATEGORY_TYPES[0]
    );
  }, [form.type]);

  const isFixedType = isFixedPaymentType(form.type);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }));
  };

  const handleNameSuggestion = (suggestion) => {
    const hint = NAME_TYPE_HINTS.find((item) => item.match.test(suggestion));

    setForm((prev) => ({
      ...prev,
      name: suggestion,
      type: hint?.type || prev.type,
    }));
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      type: category.type || "default",
      budget: String(Number(category.budget) || ""),
      icon: category.icon || "",
      color: category.color || "#7b2cbf",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleArchive = async (id) => {
    const confirmed = window.confirm("Archive this category?");
    if (!confirmed) return;

    const response = await archiveCategory(id);

    if (!response.success) {
      showToast("error", response.message || "Failed to archive category.");
      return;
    }

    showToast("success", "Category archived successfully.");
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast("error", "Category name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        type: form.type,
        budget: Number(form.budget || 0),
        icon: form.icon,
        color: form.color,
      };

      let response;

      if (editingId) {
        response = await updateCategory({
          id: editingId,
          ...payload,
        });
      } else {
        response = await createCategory({
          cycleId: activeCycle.id,
          ...payload,
        });
      }

      if (!response.success) {
        showToast("error", response.message || "Failed to save category.");
        return;
      }

      showToast(
        "success",
        editingId
          ? "Category updated successfully."
          : "Successfully added the category."
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
        title={editingId ? "Edit Budget" : "Budgets"}
        subtitle={`${categories.length} categories · ₹${totalBudget.toLocaleString()} total`}
        right={
          <button
            type="button"
            onClick={() => navigate("/transfers")}
            className="shrink-0 rounded-full bg-[#5a189a] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#7b2cbf]"
          >
            Rebalance
          </button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3"
      >
        <div className="mb-2.5 grid grid-cols-2 gap-2">
          <SuggestTextInput
            compact
            label="Name"
            name="name"
            placeholder="Select or type"
            value={form.name}
            onChange={handleChange}
            suggestions={CATEGORY_NAME_SUGGESTIONS}
            onSelectSuggestion={handleNameSuggestion}
          />

          <CategoryTypeSelect
            value={form.type}
            options={CATEGORY_TYPES}
            onChange={handleTypeChange}
          />
        </div>

        <p className="mb-2.5 text-[10px] leading-snug text-[#9d4edd]">
          <span className="text-[#c77dff]">{selectedTypeMeta.label}</span>
          {" · "}
          {isFixedType
            ? "paid / unpaid · Due or Paid on Home"
            : "flexible · budget meter on Home"}
        </p>

        <TextInput
          compact
          label="Budget"
          type="number"
          name="budget"
          placeholder="5000"
          value={form.budget}
          onChange={handleChange}
        />

        <div className="mt-1 flex gap-2">
          <PrimaryButton
            compact
            type="submit"
            disabled={saving || loading}
          >
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
          <h3 className="text-sm font-semibold text-[#e0aaff]">Categories</h3>
          <span className="text-[11px] text-[#9d4edd]">
            {categories.length} items
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] px-4 py-5 text-center">
            <p className="text-xs text-[#c77dff]">No categories yet.</p>
            {previousCycle && (
              <button
                type="button"
                onClick={openImportModal}
                className="mt-3 rounded-xl border border-[#22d3ee]/30 bg-[#0891b2]/15 px-4 py-2 text-xs font-medium text-[#67e8f9] transition hover:bg-[#0891b2]/25"
              >
                Import from {previousCycle.cycle_name || previousCycle.cycleName}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e0aaff1f] bg-[#240046] divide-y divide-[#3c096c]">
            {categories.map((category) => {
              const isFixed = isFixedPaymentType(category.type);

              return (
                <div
                  key={category.id}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: category.color || "#7b2cbf" }}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {category.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <p className="truncate text-[10px] capitalize text-[#9d4edd]">
                        {category.type}
                      </p>
                      <FlowBadge flow={isFixed ? "fixed" : "flexible"} />
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-white">
                    ₹{Number(category.budget).toLocaleString()}
                  </p>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <EditAction onClick={() => handleEdit(category)} />
                    <ArchiveAction onClick={() => handleArchive(category.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImportBudgetsModal
        open={importOpen}
        sourceCycleName={previousCycle?.cycle_name || previousCycle?.cycleName}
        categories={sourceCategories}
        selectedIds={selectedIds}
        loading={loadingSource}
        saving={importing}
        onClose={() => setImportOpen(false)}
        onToggle={toggleSelected}
        onSelectAll={() =>
          setSelectedIds(sourceCategories.map((item) => item.id))
        }
        onClearAll={() => setSelectedIds([])}
        onConfirm={handleConfirmImport}
      />
    </ScreenLayout>
  );
};

export default CategorySetup;
