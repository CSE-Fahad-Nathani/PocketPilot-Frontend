const EmptyTransactions = ({ filtered = false }) => {
  return (
    <div className="rounded-2xl border border-dashed border-[#7b2cbf]/40 bg-[#240046] px-4 py-8 text-center">
      <p className="text-sm font-medium text-[#e0aaff]">
        {filtered ? "No matching transactions." : "No transactions found."}
      </p>
      <p className="mt-1 text-xs text-[#9d4edd]">
        {filtered
          ? "Try a different search or filter."
          : "Your saving activity will appear here."}
      </p>
    </div>
  );
};

export default EmptyTransactions;
