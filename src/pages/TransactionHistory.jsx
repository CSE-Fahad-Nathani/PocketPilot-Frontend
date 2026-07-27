import { useEffect, useMemo, useState } from "react";

import ScreenLayout from "../components/ScreenLayout";
import PageHeader from "../components/PageHeader";
import TransactionCard from "../components/transactions/TransactionCard";
import TransactionFilter from "../components/transactions/TransactionFilter";
import TransactionSearch from "../components/transactions/TransactionSearch";
import TransactionSkeleton from "../components/transactions/TransactionSkeleton";
import EmptyTransactions from "../components/transactions/EmptyTransactions";

import useTransactionStore from "../store/transactionStore";
import {
  filterTransactions,
  groupTransactionsByDate,
} from "../utils/transactionMeta";

const TransactionHistory = () => {
  const { transactions, loading, error, fetchTransactions } =
    useTransactionStore();

  const [filterId, setFilterId] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filterId, search);
  }, [transactions, filterId, search]);

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const isFiltered = filterId !== "all" || Boolean(search.trim());

  return (
    <ScreenLayout>
      <PageHeader
        compact
        title="Transaction History"
        subtitle={`${transactions.length} total transactions`}
      />

      <div className="mb-3 space-y-3">
        <TransactionSearch value={search} onChange={setSearch} />
        <TransactionFilter value={filterId} onChange={setFilterId} />
      </div>

      {loading ? (
        <TransactionSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-[#ef4444]/30 bg-[#240046] px-4 py-6 text-center">
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
        <div className="space-y-4 pb-4">
          {groupedTransactions.map((group) => (
            <section key={group.key}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#e0aaff]">
                  {group.label}
                </h3>
                <span className="text-[10px] text-[#9d4edd]">
                  {group.items.length} items
                </span>
              </div>

              <div className="space-y-2">
                {group.items.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </ScreenLayout>
  );
};

export default TransactionHistory;
