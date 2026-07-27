import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
};

export default AppLayout;
