import React, { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import Card from "../components/ui/Card";

function getStatusBadgeClass(status) {
  return `status-badge status-${status}`;
}

function AdminDashboard() {
  const [summary, setSummary] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load admin dashboard data.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/complaints/admin/${id}/status/`, { status });
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update status.");
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" basePath="/admin">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Complaints" value={summary.total} icon="📊" color="indigo" />
        <StatCard title="Resolved" value={summary.resolved} icon="✅" color="green" />
        <StatCard title="Pending" value={summary.pending} icon="⏳" color="amber" />
      </section>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <section id="complaints">
        <Card title="All Complaints" subtitle="Update status and monitor progress in real time.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Update</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition">
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-100">{complaint.user}</td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-100">{complaint.title}</td>
                    <td className="py-3 pr-4 capitalize text-slate-700 dark:text-slate-100">{complaint.category}</td>
                    <td className="py-3 pr-4 capitalize text-slate-700 dark:text-slate-100">{complaint.priority}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{complaint.description}</td>
                    <td className="py-3 pr-4">
                      <span className={getStatusBadgeClass(complaint.status)}>
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      >
                        <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="pending">Pending</option>
                        <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="in_progress">In Progress</option>
                        <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;
