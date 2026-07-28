import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatShortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const formatNumber = (value, digits = 1) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("en-IN", { maximumFractionDigits: digits });
};

const FuelMileageTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/95 px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-white">{item.dateLabel}</p>
      <div className="mt-1 space-y-1 text-[11px]">
        <div className="flex justify-between gap-4">
          <span className="text-[#22d3ee]">Mileage</span>
          <span className="text-white">{formatNumber(item.mileage)} km/L</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#94a3b8]">Distance</span>
          <span className="text-white">{formatNumber(item.distance)} km</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#94a3b8]">Liters</span>
          <span className="text-white">{formatNumber(item.liters, 2)} L</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#94a3b8]">Cost</span>
          <span className="text-white">{formatAmount(item.amount)}</span>
        </div>
      </div>
    </div>
  );
};

const FuelMileageChart = ({ fuelAnalysis, compact = false }) => {
  const summary = fuelAnalysis?.summary;
  const history = fuelAnalysis?.history || [];

  const chartData = useMemo(
    () =>
      [...history]
        .sort(
          (a, b) =>
            new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime()
        )
        .map((item) => ({
          ...item,
          dateLabel: formatShortDate(item.expense_date),
          mileage: Number(item.mileage || 0),
          distance: Number(item.distance || 0),
          liters: Number(item.liters || 0),
          amount: Number(item.amount || 0),
        })),
    [history]
  );

  if (!chartData.length) return null;

  const avgMileage = Number(summary?.average_mileage || 0);

  const statItems = [
    {
      label: "Avg",
      value: `${formatNumber(summary?.average_mileage)} km/L`,
      tone: "text-[#22d3ee]",
    },
    {
      label: "Best",
      value: `${formatNumber(summary?.best_mileage)} km/L`,
      tone: "text-[#4ade80]",
    },
    {
      label: "Worst",
      value: `${formatNumber(summary?.worst_mileage)} km/L`,
      tone: "text-[#f97316]",
    },
    {
      label: "Distance",
      value: `${formatNumber(summary?.total_distance, 0)} km`,
      tone: "text-white",
    },
  ];

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-white">Mileage Trend</p>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">
          {chartData.length} fuel fills · {formatAmount(summary?.total_fuel_expense)} spent
        </p>
      </div>

      <div className={`mb-3 grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#3c096c] bg-[#3c096c]/20 px-2.5 py-2 text-center"
          >
            <p className="text-[9px] uppercase tracking-wide text-[#9d4edd]">
              {stat.label}
            </p>
            <p className={`mt-0.5 text-[11px] font-semibold ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className={compact ? "h-48" : "h-56"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#3c096c" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "#c77dff", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#9d4edd", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<FuelMileageTooltip />} />
            {avgMileage > 0 ? (
              <ReferenceLine
                y={avgMileage}
                stroke="#eab308"
                strokeDasharray="4 4"
                label={{
                  value: `Avg ${formatNumber(avgMileage)}`,
                  fill: "#eab308",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="mileage"
              name="Mileage"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#22d3ee", stroke: "#0e7490", strokeWidth: 1 }}
              activeDot={{ r: 6, fill: "#67e8f9" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FuelMileageChart;
