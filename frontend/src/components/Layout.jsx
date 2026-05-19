import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function Layout() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-noise" />
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
