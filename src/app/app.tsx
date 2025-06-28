import AppHeader from "@/features/header";
import { Outlet } from "react-router";

export default function App() {
  return (
    <div className="bg-gray-500">
      <AppHeader />
      <Outlet />
    </div>
  );
}
