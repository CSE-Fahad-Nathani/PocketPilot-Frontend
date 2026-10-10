import { Navigate } from "react-router-dom";

/** Legacy route — bucket history lives under Analysis → Savings. */
const TransactionHistory = () => (
  <Navigate to="/analysis?tab=savings#bucket-activity" replace />
);

export default TransactionHistory;
