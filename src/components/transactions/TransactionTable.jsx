import {
  formatTransactionAmount,
  getTransactionMeta,
} from "../../utils/transactionMeta";

const TransactionTable = ({ groups }) => {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-1 flex items-center justify-between px-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#e0aaff]">
              {group.label}
            </p>
            <span className="text-[9px] text-[#9d4edd]">{group.items.length}</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#3c096c]">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-[#3c096c] bg-[#3c096c]/40 text-[8px] uppercase tracking-wide text-[#9d4edd]">
                  <th className="w-[22%] px-2 py-1 font-medium">Type</th>
                  <th className="px-2 py-1 font-medium">Details</th>
                  <th className="w-[28%] px-2 py-1 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c096c]">
                {group.items.map((transaction) => {
                  const meta = getTransactionMeta(transaction.type);
                  const amountLabel = formatTransactionAmount(transaction);

                  return (
                    <tr
                      key={transaction.id}
                      className="bg-[#240046]/60 align-middle"
                    >
                      <td className="px-2 py-1.5">
                        <span
                          className={`inline-block max-w-full truncate rounded border px-1 py-0.5 text-[8px] font-medium uppercase ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="min-w-0 px-2 py-1.5">
                        <p className="truncate text-[11px] font-medium text-white">
                          {transaction.title || "—"}
                        </p>
                        <p className="truncate text-[9px] text-[#9d4edd]">
                          {transaction.bucketName || "—"}
                          {transaction.note
                            ? ` · ${transaction.note}`
                            : ""}
                        </p>
                      </td>
                      <td
                        className={`px-2 py-1.5 text-right text-[11px] font-semibold ${meta.tone}`}
                      >
                        {amountLabel}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionTable;
