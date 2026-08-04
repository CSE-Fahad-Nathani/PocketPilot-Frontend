import {
  FiBarChart2,
  FiClock,
  FiCreditCard,
  FiGrid,
  FiHome,
  FiLayers,
  FiX,
  FiMoreHorizontal,
  FiRepeat,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useCycleStore from "../store/cycleStore";

const activePrimaryNav = [
  { to: "/", label: "Home", shortLabel: "Home", end: true, Icon: FiHome },
  { to: "/expenses", label: "Spend", shortLabel: "Spend", Icon: FiLayers },
  { to: "/categories", label: "Budgets", shortLabel: "Budget", Icon: FiGrid },
];

const activeMoreNav = [
  { to: "/income", label: "Income", Icon: FiCreditCard },
  { to: "/transfers", label: "Moves", Icon: FiRepeat },
  { to: "/analysis", label: "Stats", Icon: FiBarChart2 },
  { to: "/transactions", label: "History", Icon: FiClock },
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
            <div className="absolute inset-x-0 bottom-[calc(100%+12px)] rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(8,47,73,0.98),rgba(15,23,42,0.98))] p-3 shadow-[0_18px_40px_rgba(8,47,73,0.45)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
                    More
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    Quick access to extra pages
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-slate-900/40 text-cyan-200 transition hover:bg-slate-800/70"
                  aria-label="Close more menu"
                >
                  <FiX size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {moreNav.map(({ to, label, Icon }) => {
                  const isActive = location.pathname === to;

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                        isActive
                          ? "border-cyan-300/35 bg-cyan-400/12 text-white shadow-[0_8px_20px_rgba(34,211,238,0.14)]"
                          : "border-slate-700 bg-slate-900/35 text-slate-200 hover:bg-slate-800/65"
                      }`}
                    >
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-cyan-300/12 text-cyan-100"
                            : "bg-slate-800/80 text-cyan-200"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0">
                        <span className="block font-medium">{label}</span>
                        <span className="block text-[10px] text-slate-400">
                          Open {label.toLowerCase()}
                        </span>
                      </div>
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
                {moreOpen ? <FiX size={15} /> : <FiMoreHorizontal size={15} />}
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
