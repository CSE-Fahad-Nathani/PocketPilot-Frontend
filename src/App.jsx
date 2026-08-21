import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import CycleSetup from "./pages/CycleSetup";
import CategorySetup from "./pages/CategorySetup";
import CategoryTransfers from "./pages/CategoryTransfers";
import IncomeSetup from "./pages/IncomeSetup";
import Expenses from "./pages/Expenses";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import TransactionHistory from "./pages/TransactionHistory";
import Login from "./pages/Login";

import AppLayout from "./components/AppLayout";
import AppLoader from "./components/AppLoader";
import ToastContainer from "./components/ToastContainer";

import useAuthStore from "./store/authStore";
import useCycleStore from "./store/cycleStore";
import useCategoryStore from "./store/categoryStore";
import useIncomeStore from "./store/incomeStore";
import useExpenseStore from "./store/expenseStore";
import useCategoryTransferStore from "./store/categoryTransferStore";
import { wakeServer } from "./utils/wakeServer";

const App = () => {
  const session = useAuthStore((state) => state.session);
  const setCycleId = useAuthStore((state) => state.setCycleId);
  const { activeCycle, getActiveCycle } = useCycleStore();
  const { getCategories } = useCategoryStore();
  const { getIncome } = useIncomeStore();
  const { getExpenses } = useExpenseStore();
  const { getTransfers } = useCategoryTransferStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.authenticated) {
      setLoading(true);
      return undefined;
    }

    let cancelled = false;

    const init = async () => {
      setLoading(true);

      // Continue waking / wait for Render if login didn't finish the ping.
      await wakeServer();

      try {
        const cycleResponse = await getActiveCycle();

        if (cancelled) return;

        if (cycleResponse.success && cycleResponse.data) {
          const cycleId = cycleResponse.data.id;
          setCycleId(cycleId);
          await Promise.all([
            getCategories(cycleId),
            getIncome(cycleId),
            getExpenses(cycleId),
            getTransfers(cycleId),
          ]);
        } else {
          setCycleId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [session?.authenticated]);

  let content;

  if (!session?.authenticated) {
    content = <Login />;
  } else if (loading) {
    content = (
      <AppLoader
        title="PocketPilot"
        subtitle="Loading your workspace"
      />
    );
  } else if (!activeCycle) {
    content = (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<CycleSetup />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  } else {
    content = (
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<IncomeSetup />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/transfers" element={<CategoryTransfers />} />
          <Route path="/categories" element={<CategorySetup />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      <ToastContainer />
      {content}
    </>
  );
};

export default App;
