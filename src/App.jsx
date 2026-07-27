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

import AppLayout from "./components/AppLayout";
import ToastContainer from "./components/ToastContainer";

import useCycleStore from "./store/cycleStore";
import useCategoryStore from "./store/categoryStore";
import useIncomeStore from "./store/incomeStore";
import useExpenseStore from "./store/expenseStore";
import useCategoryTransferStore from "./store/categoryTransferStore";

const App = () => {
  const { activeCycle, getActiveCycle } = useCycleStore();
  const { getCategories } = useCategoryStore();
  const { getIncome } = useIncomeStore();
  const { getExpenses } = useExpenseStore();
  const { getTransfers } = useCategoryTransferStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const cycleResponse = await getActiveCycle();

        if (cycleResponse.success && cycleResponse.data) {
          const cycleId = cycleResponse.data.id;
          await Promise.all([
            getCategories(cycleId),
            getIncome(cycleId),
            getExpenses(cycleId),
            getTransfers(cycleId),
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  let content;

  if (loading) {
    content = (
      <div className="flex min-h-screen items-center justify-center bg-[#10002b] text-white">
        Loading...
      </div>
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
