import AppHeader from "@/features/header";
import { Outlet } from "react-router";

export default function App() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  );
}
