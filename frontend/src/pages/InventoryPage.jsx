import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Inventory from "./Inventory";

export default function InventoryPage() {
  return (
    <div style={S.layout}>
      <Sidebar />
      <div style={S.main}>
        <Navbar title="Textile Inventory Management" />
        <div style={S.content}>
          <Inventory />
        </div>
      </div>
    </div>
  );
}

const S = {
  layout: {
    display: "flex", minHeight: "100vh",
    backgroundColor: "#f9fafb", fontFamily: "'Segoe UI',sans-serif",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  content: { padding: "32px" },
};