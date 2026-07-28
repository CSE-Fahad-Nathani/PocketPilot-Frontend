import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

import FuelMileageChart from "./FuelMileageChart";
import { getCurrentMonthFuelAnalysis } from "../services/analysisService";

const FuelAnalysisModal = ({ open, categoryName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fuelAnalysis, setFuelAnalysis] = useState(null);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCurrentMonthFuelAnalysis();

      if (response.success) {
        setFuelAnalysis(response.data || null);
      } else {
        setError(response.message || "Failed to load fuel analysis.");
        setFuelAnalysis(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load fuel analysis."
      );
      setFuelAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    loadAnalysis();

    return () => {
      setFuelAnalysis(null);
      setError(null);
    };
  }, [open]);

  if (!open) return null;

  const hasHistory = (fuelAnalysis?.history?.length || 0) > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-t-2xl border border-[#7b2cbf]/40 bg-[#240046] p-4 shadow-2xl shadow-black/50 sm:rounded-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">Fuel Analysis</h2>
            <p className="mt-0.5 text-sm text-[#e0aaff]">{categoryName}</p>
            <p className="mt-0.5 text-[10px] text-[#9d4edd]">Current month</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#3c096c] p-1.5 text-[#c77dff] transition hover:bg-[#3c096c]"
            aria-label="Close fuel analysis"
          >
            <FiX size={16} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            <div className="h-12 animate-pulse rounded-xl bg-[#3c096c]/60" />
            <div className="h-48 animate-pulse rounded-xl bg-[#3c096c]/40" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#ef4444]/30 bg-[#3c096c]/20 px-3 py-4 text-center">
            <p className="text-sm text-[#fca5a5]">{error}</p>
            <button
              type="button"
              onClick={loadAnalysis}
              className="mt-3 rounded-full bg-[#5a189a] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#7b2cbf]"
            >
              Retry
            </button>
          </div>
        ) : !hasHistory ? (
          <div className="rounded-xl border border-dashed border-[#7b2cbf]/40 px-3 py-6 text-center">
            <p className="text-sm text-[#c77dff]">No fuel fills this month yet.</p>
            <p className="mt-1 text-[10px] text-[#9d4edd]">
              Add fuel expenses with distance and liters to see mileage trends.
            </p>
          </div>
        ) : (
          <FuelMileageChart fuelAnalysis={fuelAnalysis} compact />
        )}
      </div>
    </div>
  );
};

export default FuelAnalysisModal;
