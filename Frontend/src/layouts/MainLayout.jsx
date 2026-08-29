import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 px-6 md:px-10 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
}