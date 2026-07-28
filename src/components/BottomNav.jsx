import {
  FiBarChart2,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiGrid,
  FiHome,
  FiLayers,
  FiMoreHorizontal,
  FiRepeat,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useCycleStore from "../store/cycleStore";

const activePrimaryNav = [
  { to: "/", label: "Home", shortLabel: "Home", end: true, Icon: FiHome },
  { to: "/income", label: "Income", shortLabel: "Income", Icon: FiCreditCard },
  { to: "/expenses", label: "Spend", shortLabel: "Spend", Icon: FiLayers },
  { to: "/transfers", label: "Rebalance", shortLabel: "Moves", Icon: FiRepeat },
  { to: "/categories", label: "Budgets", shortLabel: "Budget", Icon: FiGrid },
];

const activeMoreNav = [
  { to: "/analysis", label: "Stats", shortLabel: "Stats", Icon: FiBarChart2 },
  { to: "/transactions", label: "History", shortLabel: "History", Icon: FiClock },
];

const setupPrimaryNav = [
  { to: "/", label: "Setup", shortLabel: "Setup", end: true, Icon: FiGrid },
];

const setupMoreNav = [
  { to: "/analysis", label: "Stats", shortLabel: "Stats", Icon: FiBarChart2 },
  { to: "/transactions", label: "History", shortLabel: "History", Icon: FiClock },
];

const BottomNav = () => {
  const { activeCycle } = useCycleStore();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryNav = activeCycle ? activePrimaryNav : setupPrimaryNav;
  const moreNav = activeCycle ? activeMoreNav : setupMoreNav;

  const moreActive = useMemo(
    () => moreNav.some((item) => location.pathname === item.to),
    [location.pathname, moreNav]
  );

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 px-3">
      <div className="mx-auto max-w-md">
        <div className="relative rounded-[28px] border border-[#e0aaff1f] bg-[#240046]/95 px-2 py-2 shadow-[0_16px_40px_rgba(16,0,43,0.45)] backdrop-blur-xl">
          {moreOpen ? (
            <div className="absolute bottom-[calc(100%+10px)] right-2 w-48 rounded-3xl border border-[#e0aaff1f] bg-[#240046]/98 p-2 shadow-[0_18px_40px_rgba(16,0,43,0.5)] backdrop-blur-xl">
              <div className="mb-1 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9d4edd]">
                More
              </div>
              <div className="space-y-1">
                {moreNav.map(({ to, label, Icon }) => {
                  const isActive = location.pathname === to;

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-[#5a189a]/60 text-white"
                          : "text-[#c77dff] hover:bg-[#3c096c]/45"
                      }`}
                    >
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                          isActive
                            ? "bg-[#c77dff]/12 text-white"
                            : "bg-[#3c096c]/35 text-[#c77dff]"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="font-medium">{label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-1">
            {primaryNav.map(({ to, label, shortLabel, end, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition ${
                    isActive
                      ? "bg-[#5a189a]/60 text-white shadow-[0_8px_20px_rgba(90,24,154,0.35)]"
                      : "text-[#c77dff] hover:bg-[#3c096c]/45"
                  }`
                }
                aria-label={label}
                title={label}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`mb-1 inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                        isActive
                          ? "border-[#c77dff]/30 bg-[#c77dff]/12 text-white"
                          : "border-transparent bg-[#3c096c]/35 text-[#c77dff] group-hover:bg-[#3c096c]/55"
                      }`}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="text-[10px] font-medium leading-none">
                      {shortLabel}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              className={`group flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition ${
                moreOpen || moreActive
                  ? "bg-[#5a189a]/60 text-white shadow-[0_8px_20px_rgba(90,24,154,0.35)]"
                  : "text-[#c77dff] hover:bg-[#3c096c]/45"
              }`}
              aria-label="More options"
              aria-expanded={moreOpen}
            >
              <span
                className={`mb-1 inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                  moreOpen || moreActive
                    ? "border-[#c77dff]/30 bg-[#c77dff]/12 text-white"
                    : "border-transparent bg-[#3c096c]/35 text-[#c77dff] group-hover:bg-[#3c096c]/55"
                }`}
              >
                {moreOpen ? <FiChevronUp size={15} /> : <FiMoreHorizontal size={15} />}
              </span>
              <span className="text-[10px] font-medium leading-none">More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
