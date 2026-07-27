import { FiArchive, FiEdit2, FiTrash2 } from "react-icons/fi";

const baseClass =
  "inline-flex items-center justify-center rounded-lg p-1.5 transition hover:bg-[#3c096c]";

export const EditAction = ({ onClick, label = "Edit" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`${baseClass} text-[#c77dff] hover:text-white`}
  >
    <FiEdit2 size={14} />
  </button>
);

export const DeleteAction = ({ onClick, label = "Delete" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`${baseClass} text-[#ff7b7b] hover:text-[#ff9b9b]`}
  >
    <FiTrash2 size={14} />
  </button>
);

export const ArchiveAction = ({ onClick, label = "Archive" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`${baseClass} text-[#ff7b7b] hover:text-[#ff9b9b]`}
  >
    <FiArchive size={14} />
  </button>
);
