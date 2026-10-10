import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import TransactionTable from "../transactions/TransactionTable";
import TransactionFilter from "../transactions/TransactionFilter";
import TransactionSearch from "../transactions/TransactionSearch";
import TransactionSkeleton from "../transactions/TransactionSkeleton";
import EmptyTransactions from "../transactions/EmptyTransactions";
import CollapsibleSection from "./CollapsibleSection";

import useTransactionStore from "../../store/transactionStore";
import {
  filterTransactions,
  groupTransactionsByDate,
} from "../../utils/transactionMeta";

const BucketActivityPanel = () => {
  const location = useLocation();
  const { transactions, loading, error, fetchTransactions } =
    useTransactionStore();

  const [filterId, setFilterId] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (location.hash === "#bucket-activity") {
      setOpen(true);
    }
  }, [location.hash]);

  useEffect(() => {
    if (!loading && transactions.length > 0) {
      setOpen(true);
    }
  }, [loading, transactions.length]);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filterId, search);
  }, [transactions, filterId, search]);

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const isFiltered = filterId !== "all" || Boolean(search.trim());

  return (
    <CollapsibleSection
      id="bucket-activity"
      title="Bucket activity"
      count={`${transactions.length} bucket movements · search & filter`}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="space-y-3 rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3">
        <TransactionSearch value={search} onChange={setSearch} />
        <TransactionFilter value={filterId} onChange={setFilterId} />

        {loading ? (
          <TransactionSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-[#ef4444]/30 bg-[#3c096c]/40 px-4 py-5 text-center">
            <p className="text-sm text-[#fca5a5]">{error}</p>
            <button
              type="button"
              onClick={fetchTransactions}
              className="mt-3 rounded-full bg-[#5a189a] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#7b2cbf]"
            >
              Retry
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyTransactions filtered={isFiltered && transactions.length > 0} />
        ) : (
          <TransactionTable groups={groupedTransactions} />
        )}
      </div>
    </CollapsibleSection>
  );
};

export default BucketActivityPanel;
