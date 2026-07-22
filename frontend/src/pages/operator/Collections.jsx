import React, { useState } from "react";
import Table from "../../components/Table";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { ToastContainer, useToast } from "../../components/Toast";
import { FiSearch } from "react-icons/fi";

const MOCK = [
  { id: "COL-001", batch_id: "WB-001", facility: "Green Facility A", scheduled: "2025-07-10", status: "Pending", weight: "45 kg" },
  { id: "COL-002", batch_id: "WB-002", facility: "EcoRecycle B", scheduled: "2025-07-11", status: "Completed", weight: "30 kg" },
  { id: "COL-003", batch_id: "WB-003", facility: "Green Facility A", scheduled: "2025-07-12", status: "In Transit", weight: "60 kg" },
  { id: "COL-004", batch_id: "WB-004", facility: "CleanTex C", scheduled: "2025-07-13", status: "Pending", weight: "20 kg" },
  { id: "COL-005", batch_id: "WB-005", facility: "EcoRecycle B", scheduled: "2025-07-14", status: "Completed", weight: "55 kg" },
];

const STATUS_PRESET = {
  Pending: "warning",
  Completed: "success",
  "In Transit": "info",
  Cancelled: "danger",
};

const NEXT_STATUS = {
  Pending: "In Transit",
  "In Transit": "Completed",
};

export default function Collections() {
  const [data, setData] = useState(MOCK);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const { toasts, add, remove } = useToast();

  const filtered = data.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.batch_id.toLowerCase().includes(search.toLowerCase()) ||
      r.facility.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const advance = (id) => {
    setData((prev) =>
      prev.map((r) =>
        r.id === id && NEXT_STATUS[r.status]
          ? { ...r, status: NEXT_STATUS[r.status] }
          : r
      )
    );
    add("Collection status updated.");
  };

  const columns = [
    { key: "id", label: "Collection ID" },
    { key: "batch_id", label: "Batch ID" },
    { key: "facility", label: "Facility" },
    { key: "scheduled", label: "Scheduled Date" },
    { key: "weight", label: "Weight" },
    {
      key: "status", label: "Status",
      render: (v) => <Badge label={v} preset={STATUS_PRESET[v] || "gray"} />,
    },
    {
      key: "_action", label: "Action",
      render: (_, row) =>
        NEXT_STATUS[row.status] ? (
          <Button size="sm" variant="secondary" onClick={() => advance(row.id)}>
            Mark as {NEXT_STATUS[row.status]}
          </Button>
        ) : (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>
        ),
    },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onClose={remove} />
      <PageHeader title="Collections" subtitle={`${filtered.length} collection requests`} />

      <Card padding="16px 20px" style={{ marginBottom: 16 }}>
        <div style={S.row}>
          <div style={S.searchWrap}>
            <FiSearch size={14} color="#9ca3af" />
            <input
              style={S.search}
              placeholder="Search by ID, batch, facility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={S.filters}>
            {["All", "Pending", "In Transit", "Completed"].map((f) => (
              <button
                key={f}
                style={{
                  ...S.filterBtn,
                  backgroundColor: filter === f ? "#1d4ed8" : "#f3f4f6",
                  color: filter === f ? "#fff" : "#374151",
                }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Table columns={columns} data={filtered} emptyMessage="No collection requests found." />
    </>
  );
}

const S = {
  row: { display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, flex: 1 },
  search: { flex: 1, border: "none", outline: "none", fontSize: 14, color: "#374151", backgroundColor: "transparent", fontFamily: "inherit" },
  filters: { display: "flex", gap: 6 },
  filterBtn: { padding: "6px 12px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" },
};