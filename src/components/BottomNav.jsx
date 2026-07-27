import { NavLink } from "react-router-dom";
import useCycleStore from "../store/cycleStore";

const activeNav = [
  { to: "/", label: "Home", end: true },
  { to: "/income", label: "Income" },
  { to: "/expenses", label: "Spend" },
  { to: "/transfers", label: "Rebalance" },
  { to: "/categories", label: "Budgets" },
  { to: "/analysis", label: "Stats" },
  { to: "/transactions", label: "History" },
];

const setupNav = [
  { to: "/", label: "Setup", end: true },
  { to: "/analysis", label: "Stats" },
  { to: "/transactions", label: "History" },
];

const BottomNav = () => {
  const { activeCycle } = useCycleStore();
  const navItems = activeCycle ? activeNav : setupNav;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-[#3c096c] bg-[#240046]">
      <div className="mx-auto flex max-w-md items-center justify-around px-1 py-3">
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-1 text-[10px] transition ${
                isActive
                  ? "font-semibold text-white"
                  : "text-[#c77dff]"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
