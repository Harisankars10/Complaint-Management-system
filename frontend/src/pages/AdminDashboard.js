import React, { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import Card from "../components/ui/Card";

function getStatusBadgeClass(status) {
  return `status-badge status-${status}`;
}

function escapeCsvCell(value) {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadComplaintsCsv(rows) {
  const headers = [
    "id",
    "user",
    "title",
    "category",
    "priority",
    "status",
    "description",
    "admin_response",
    "created_at",
    "updated_at",
  ];
  const lines = [headers.join(",")];
  for (const c of rows) {
    lines.push(
      [
        c.id,
        c.user,
        c.title,
        c.category,
        c.priority,
        c.status,
        c.description,
        c.admin_response ?? "",
        c.created_at,
        c.updated_at ?? "",
      ]
        .map(escapeCsvCell)
        .join(",")
    );
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `complaints-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminDashboard() {
  const [summary, setSummary] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [adminNotes, setAdminNotes] = useState({});
  const [error, setError] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchData = async () => {
    try {
      const [summaryRes, complaintsRes] = await Promise.all([
        api.get("/complaints/admin/summary/"),
        api.get("/complaints/admin/all/?page=1&limit=200"),
      ]);
      const summaryPayload = summaryRes?.data?.data || summaryRes?.data || {};
      const complaintPayload = complaintsRes?.data;
      const complaintItems = Array.isArray(complaintPayload?.data)
        ? complaintPayload.data
        : Array.isArray(complaintPayload)
          ? complaintPayload
          : [];

      setSummary({
        total: summaryPayload.total || 0,
        pending: summaryPayload.pending || 0,
        in_progress: summaryPayload.in_progress || 0,
        resolved: summaryPayload.resolved || 0,
      });
      setComplaints(complaintItems);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin dashboard data.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAdminNotes((prev) => {
      const next = { ...prev };
      complaints.forEach((c) => {
        if (!(c.id in next)) next[c.id] = c.admin_response ?? "";
      });
      return next;
    });
  }, [complaints]);

  useEffect(() => {
    if (detailId != null && !complaints.some((c) => c.id === detailId)) {
      setDetailId(null);
    }
  }, [complaints, detailId]);

  const handleStatusChange = async (id, status, { closeDetail = false } = {}) => {
    setSavingId(id);
    setError("");
    try {
      const admin_response = adminNotes[id] ?? "";
      await api.patch(`/complaints/admin/${id}/status/`, { status, admin_response });
      await fetchData();
      if (closeDetail) setDetailId(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update status.");
    } finally {
      setSavingId(null);
    }
  };

  const detailComplaint = detailId != null ? complaints.find((c) => c.id === detailId) : null;

  const handleMarkSolved = async (id) => {
    const msg = (adminNotes[id] ?? "").trim();
    if (msg.length < 8) {
      const ok = window.confirm(
        "Add a short resolution message for the user (what was done). Mark as solved anyway without a detailed note?"
      );
      if (!ok) return;
    }
    await handleStatusChange(id, "resolved", { closeDetail: true });
  };

  const handleSaveNoteOnly = async (id) => {
    setSavingId(id);
    setError("");
    try {
      const complaint = complaints.find((c) => c.id === id);
      const admin_response = adminNotes[id] ?? "";
      await api.patch(`/complaints/admin/${id}/status/`, {
        status: complaint?.status ?? "pending",
        admin_response,
      });
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save note.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" basePath="/admin">
      <section id="dashboard" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 scroll-mt-24">
        <StatCard title="Total Complaints" value={summary.total} icon="📊" color="indigo" />
        <StatCard title="Resolved" value={summary.resolved} icon="✅" color="green" />
        <StatCard title="Pending" value={summary.pending} icon="⏳" color="amber" />
      </section>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <section id="complaints" className="scroll-mt-24">
        <Card
          title="All Complaints"
          subtitle="Open a complaint to read the full text and attachment. When it is fixed, add a short message and mark it as solved — the user will see your note on their dashboard."
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadComplaintsCsv(complaints)}
              disabled={complaints.length === 0}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4 max-w-[200px]">Preview</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 min-w-[160px]">Reply (preview)</th>
                  <th className="py-2 pr-4 whitespace-nowrap">Updated</th>
                  <th className="py-2">Quick actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition align-top">
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-100">{complaint.user}</td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-100">
                      <span className="font-medium">{complaint.title}</span>
                      <button
                        type="button"
                        onClick={() => setDetailId(complaint.id)}
                        className="mt-1 block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Read full complaint
                      </button>
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-700 dark:text-slate-100">{complaint.category}</td>
                    <td className="py-3 pr-4 capitalize text-slate-700 dark:text-slate-100">{complaint.priority}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 max-w-[200px]">
                      <span className="line-clamp-2 text-xs">{complaint.description}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={getStatusBadgeClass(complaint.status)}>
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <textarea
                        rows={2}
                        value={adminNotes[complaint.id] ?? ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({ ...prev, [complaint.id]: e.target.value }))
                        }
                        placeholder="What was done? (shown to user when solved)"
                        className="w-full min-w-[180px] rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
                      />
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
                      {complaint.updated_at ? new Date(complaint.updated_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <select
                          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
                          value={complaint.status}
                          disabled={savingId === complaint.id}
                          onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        >
                          <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="pending">Pending</option>
                          <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="in_progress">In progress</option>
                          <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="resolved">Solved / resolved</option>
                        </select>
                        <button
                          type="button"
                          disabled={savingId === complaint.id}
                          onClick={() => handleSaveNoteOnly(complaint.id)}
                          className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 text-xs font-medium text-indigo-800 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition disabled:opacity-50"
                        >
                          Save reply only
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {detailComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="complaint-detail-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={() => setDetailId(null)}
          />
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 shadow-xl">
            <div className="sticky top-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Complaint</p>
                <h2 id="complaint-detail-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 pr-2">
                  {detailComplaint.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="shrink-0 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 text-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium text-slate-800 dark:text-slate-200">From:</span> {detailComplaint.user}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs capitalize">
                  {detailComplaint.category}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs capitalize">
                  {detailComplaint.priority} priority
                </span>
                <span className={getStatusBadgeClass(detailComplaint.status)}>
                  {detailComplaint.status.replace("_", " ")}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Full description
                </h3>
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {detailComplaint.description}
                </p>
              </div>

              {detailComplaint.image_url && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Attachment
                  </h3>
                  <a
                    href={detailComplaint.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Open image in new tab
                  </a>
                  <div className="mt-2 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800 max-h-64">
                    <img
                      src={detailComplaint.image_url}
                      alt=""
                      className="w-full h-full object-contain max-h-64"
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-4">
                <span>
                  Submitted: {new Date(detailComplaint.created_at).toLocaleString()}
                </span>
                {detailComplaint.updated_at && (
                  <span>Updated: {new Date(detailComplaint.updated_at).toLocaleString()}</span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Message to user (when you mark this solved)
                </label>
                <textarea
                  rows={4}
                  value={adminNotes[detailComplaint.id] ?? ""}
                  onChange={(e) =>
                    setAdminNotes((prev) => ({ ...prev, [detailComplaint.id]: e.target.value }))
                  }
                  placeholder="Example: We fixed the Wi‑Fi access point in block A. Please try connecting again."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  This text appears in the user&apos;s &quot;Admin reply&quot; column after you save or change status.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2 pb-6">
                <button
                  type="button"
                  disabled={savingId === detailComplaint.id}
                  onClick={() => handleMarkSolved(detailComplaint.id)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 text-sm shadow-sm disabled:opacity-50"
                >
                  {savingId === detailComplaint.id ? "Saving…" : "Mark as solved"}
                </button>
                <button
                  type="button"
                  disabled={savingId === detailComplaint.id || detailComplaint.status === "in_progress"}
                  onClick={() => handleStatusChange(detailComplaint.id, "in_progress")}
                  className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Set in progress
                </button>
                <button
                  type="button"
                  disabled={savingId === detailComplaint.id || detailComplaint.status === "pending"}
                  onClick={() => handleStatusChange(detailComplaint.id, "pending")}
                  className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Set pending
                </button>
                <button
                  type="button"
                  disabled={savingId === detailComplaint.id}
                  onClick={() => handleSaveNoteOnly(detailComplaint.id)}
                  className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 font-medium px-4 py-2.5 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50"
                >
                  Save message only
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminDashboard;
