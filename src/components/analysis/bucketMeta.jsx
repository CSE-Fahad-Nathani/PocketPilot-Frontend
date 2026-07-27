import {
  FiBriefcase,
  FiHeart,
  FiHome,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTarget,
} from "react-icons/fi";
import { FaCar, FaPlane } from "react-icons/fa";

const ICON_MAP = {
  plane: FaPlane,
  shield: FiShield,
  car: FaCar,
  home: FiHome,
  heart: FiHeart,
  bag: FiShoppingBag,
  target: FiTarget,
  star: FiStar,
  work: FiBriefcase,
};

export const BUCKET_ICON_OPTIONS = [
  { value: "plane", label: "Trip" },
  { value: "shield", label: "Emergency" },
  { value: "car", label: "Car" },
  { value: "home", label: "Home" },
  { value: "heart", label: "Health" },
  { value: "bag", label: "Shopping" },
  { value: "target", label: "Goal" },
  { value: "star", label: "Wish" },
  { value: "work", label: "Work" },
];

export const BUCKET_COLOR_OPTIONS = [
  "#3B82F6",
  "#EF4444",
  "#22C55E",
  "#F59E0B",
  "#A855F7",
  "#EC4899",
  "#14B8A6",
  "#7b2cbf",
];

export const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const BucketIcon = ({ icon, color = "#7b2cbf", size = 16 }) => {
  const Icon = ICON_MAP[String(icon || "").toLowerCase()] || FiStar;

  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `${color}22`,
        color,
      }}
    >
      <Icon size={size} />
    </span>
  );
};
