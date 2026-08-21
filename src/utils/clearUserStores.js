import useAnalysisStore from "../store/analysisStore";
import useCategoryStore from "../store/categoryStore";
import useCategoryTransferStore from "../store/categoryTransferStore";
import useCycleStore from "../store/cycleStore";
import useExpenseStore from "../store/expenseStore";
import useIncomeStore from "../store/incomeStore";
import useSavingAllocationStore from "../store/savingAllocationStore";
import useSavingBucketStore from "../store/savingBucketStore";
import useSavingStore from "../store/savingStore";
import useTransactionStore from "../store/transactionStore";

/** Wipe in-memory user data so the next login never sees the previous account. */
export const clearUserStores = () => {
  useCycleStore.setState({ activeCycle: null, loading: false });
  useCategoryStore.setState({ categories: [], loading: false });
  useIncomeStore.setState({ income: [], loading: false });
  useExpenseStore.setState({ expenses: [], loading: false });
  useCategoryTransferStore.setState({ transfers: [], loading: false });
  useAnalysisStore.setState({
    history: [],
    selectedCycleId: null,
    analysis: null,
    loadingHistory: false,
    loadingAnalysis: false,
  });
  useSavingStore.setState({ savings: [], loading: false });
  useSavingBucketStore.setState({ buckets: [], loading: false });
  useSavingAllocationStore.setState({
    pending: [],
    loading: false,
  });
  useTransactionStore.setState({
    transactions: [],
    loading: false,
    error: null,
  });
};
