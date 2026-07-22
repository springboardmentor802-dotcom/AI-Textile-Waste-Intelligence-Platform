import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={S.root}>
      <Sidebar collapsed={!sidebarOpen} />
      <div style={S.body}>
        <Topbar
          title={title}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
        />
        <main style={S.main}>{children}</main>
      </div>
    </div>
  );
}

const S = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  main: {
    flex: 1,
    overflowY: "auto",
    padding: "28px 32px",
  },
};