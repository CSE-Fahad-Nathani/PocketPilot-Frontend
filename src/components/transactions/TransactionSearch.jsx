import { FiSearch } from "react-icons/fi";

const TransactionSearch = ({ value, onChange }) => {
  return (
    <div className="relative">
      <FiSearch
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9d4edd]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search title, bucket, note..."
        className="w-full rounded-xl border border-[#3c096c] bg-[#3c096c]/40 py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-[#9d4edd] focus:ring-2 focus:ring-[#9d4edd]"
      />
    </div>
  );
};

export default TransactionSearch;
