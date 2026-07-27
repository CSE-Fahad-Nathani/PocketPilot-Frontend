import { useEffect, useMemo, useState } from "react";

import useSavingBucketStore from "../../store/savingBucketStore";
import useSavingAllocationStore from "../../store/savingAllocationStore";
import useTransactionStore from "../../store/transactionStore";
import BucketCard, { BucketActionLegend } from "./BucketCard";
import PendingSavingCard from "./PendingSavingCard";
import CreateBucketModal from "./CreateBucketModal";
import DistributionModal from "./DistributionModal";
import WithdrawModal from "./WithdrawModal";
import TransferModal from "./TransferModal";
import ArchiveBucketDialog from "./ArchiveBucketDialog";
import { formatAmount } from "./bucketMeta";

const SavingsDistribution = () => {
  const { buckets, loading: loadingBuckets, getBuckets } = useSavingBucketStore();
  const { pending, loading: loadingPending, getPending } = useSavingAllocationStore();
  const { fetchTransactions } = useTransactionStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [distributeSaving, setDistributeSaving] = useState(null);
  const [withdrawBucket, setWithdrawBucket] = useState(null);
  const [transferBucket, setTransferBucket] = useState(null);
  const [archiveBucket, setArchiveBucket] = useState(null);

  useEffect(() => {
    getBuckets();
    getPending();
  }, []);

  const refreshAll = async () => {
    await Promise.all([getBuckets(), getPending(), fetchTransactions()]);
  };

  const totalBucketBalance = useMemo(
    () => buckets.reduce((sum, bucket) => sum + Number(bucket.balance || 0), 0),
    [buckets]
  );

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e0aaff]">Savings Distribution</h3>
      </div>

      <div className="mb-3 overflow-hidden rounded-3xl border border-[#e0aaff1f] bg-[#240046] p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9d4edd]">Saving Buckets</p>
            <p className="mt-1 text-sm text-[#c77dff]">Clean bucket list with quick actions.</p>
          </div>
          <button type="button" onClick={() => setCreateOpen(true)} className="shrink-0 rounded-full bg-[#5a189a] px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#7b2cbf]">+ Create Bucket</button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-[#3c096c] bg-[#3c096c]/30 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9d4edd]">Buckets</p>
            <p className="mt-1 text-lg font-semibold text-white">{buckets.length}</p>
          </div>
          <div className="rounded-2xl border border-[#3c096c] bg-[#3c096c]/30 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9d4edd]">Total Balance</p>
            <p className="mt-1 text-lg font-semibold text-white">{formatAmount(totalBucketBalance)}</p>
          </div>
        </div>

        <div className="mb-3">
          <BucketActionLegend />
        </div>

        {loadingBuckets ? (
          <div className="space-y-2">
            <div className="h-14 animate-pulse rounded-xl bg-[#3c096c]/60" />
            <div className="h-14 animate-pulse rounded-xl bg-[#3c096c]/40" />
          </div>
        ) : buckets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#7b2cbf]/40 bg-[#3c096c]/20 px-3 py-5 text-center">
            <p className="text-sm text-[#c77dff]">No Saving Buckets yet.</p>
            <p className="mt-1 text-[10px] text-[#9d4edd]">Create your first bucket to start organizing your savings.</p>
            <button type="button" onClick={() => setCreateOpen(true)} className="mt-3 rounded-full bg-[#5a189a] px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#7b2cbf]">Create Bucket</button>
          </div>
        ) : (
          <div className="space-y-2">
            {buckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                onWithdraw={setWithdrawBucket}
                onTransfer={setTransferBucket}
                onArchive={setArchiveBucket}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#e0aaff1f] bg-[#240046] p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-medium text-[#c77dff]">Pending Savings</p>
          <span className="text-[10px] text-[#9d4edd]">{pending.length} pending</span>
        </div>

        {loadingPending ? (
          <div className="space-y-2">
            <div className="h-16 animate-pulse rounded-xl bg-[#3c096c]/60" />
            <div className="h-16 animate-pulse rounded-xl bg-[#3c096c]/40" />
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#4ade80]/30 px-3 py-4 text-center">
            <p className="text-sm text-[#4ade80]">All savings distributed</p>
            <p className="mt-1 text-[10px] text-[#9d4edd]">Great job!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((saving) => (
              <PendingSavingCard key={saving.id} saving={saving} onDistribute={setDistributeSaving} />
            ))}
          </div>
        )}
      </div>

      <CreateBucketModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refreshAll} />
      <DistributionModal open={Boolean(distributeSaving)} saving={distributeSaving} onClose={() => setDistributeSaving(null)} onDistributed={refreshAll} />
      <WithdrawModal open={Boolean(withdrawBucket)} bucket={withdrawBucket} onClose={() => setWithdrawBucket(null)} onSuccess={refreshAll} />
      <TransferModal open={Boolean(transferBucket)} bucket={transferBucket} buckets={buckets} onClose={() => setTransferBucket(null)} onSuccess={refreshAll} />
      <ArchiveBucketDialog open={Boolean(archiveBucket)} bucket={archiveBucket} onClose={() => setArchiveBucket(null)} onSuccess={refreshAll} />
    </section>
  );
};

export default SavingsDistribution;
