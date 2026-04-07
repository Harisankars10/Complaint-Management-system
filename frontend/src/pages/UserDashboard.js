import React, { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import Card from "../components/ui/Card";

function getStatusBadgeClass(status) {
  return `status-badge status-${status}`;
}

function UserDashboard() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("technical");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const ITEMS_PER_PAGE = 5;

  const fetchComplaints = async () => {
    try {
      // Request a larger limit because this screen handles its own client-side pagination/filtering.
      const response = await api.get("/complaints/my/?page=1&limit=200");
      const payload = response?.data;
      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      setComplaints(items);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load complaints.");
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const validation = {};
    if (!title.trim()) validation.title = "Title is required.";
    if (!category) validation.category = "Please select a category.";
    if (!priority) validation.priority = "Please select a priority.";
    if (!description.trim()) validation.description = "Description is required.";
    if (description.trim().length < 10) validation.description = "Description should be at least 10 characters.";

    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const response = await api.post("/complaints/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response?.data?.message || "Complaint submitted successfully.");
      setTitle("");
      setCategory("technical");
      setPriority("medium");
      setDescription("");
      setImage(null);
      setFieldErrors({});
      fetchComplaints();
    } catch (err) {
      setError("Could not submit complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint? This cannot be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      await api.delete(`/complaints/${id}/`);
      await fetchComplaints();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete complaint.");
    } finally {
      setDeletingId(null);
    }
  };

  const total = complaints.length;
  const resolved = complaints.filter((item) => item.status === "resolved").length;
  const pending = complaints.filter((item) => item.status === "pending").length;
  const filteredComplaints = complaints.filter((item) => {
    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "pending"
          ? item.status === "pending" || item.status === "in_progress"
          : item.status === "resolved";

    const searchableText = `${item.title} ${item.description} ${item.category} ${item.priority}`.toLowerCase();
    const searchMatch = searchableText.includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <DashboardLayout title="User Dashboard" basePath="/dashboard">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Complaints" value={total} icon="📋" color="indigo" />
        <StatCard title="Resolved" value={resolved} icon="✅" color="green" />
        <StatCard title="Pending" value={pending} icon="⏳" color="amber" />
      </section>

      {message && (
        <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200 px-4 py-3 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <section id="dashboard" className="mb-6 scroll-mt-24">
        <Card title="Submit Complaint" subtitle="Share your issue with clear details for faster resolution.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Wi-Fi not working in hostel block A"
                required
              />
              {fieldErrors.title && <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="technical">Technical</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="hostel">Hostel</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="academic">Academic</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="transport">Transport</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="other">Other</option>
                </select>
                {fieldErrors.category && <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="low">Low</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="medium">Medium</option>
                  <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="high">High</option>
                </select>
                {fieldErrors.priority && <p className="mt-1 text-sm text-red-600">{fieldErrors.priority}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue, where it happened, and any useful details..."
                required
              />
              {fieldErrors.description && <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image (optional)</label>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <button
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 bg-slate-900 dark:bg-slate-700 text-white font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </Card>
      </section>

      <section id="complaints" className="scroll-mt-24">
        <Card title="My Complaints" subtitle="Auto-refreshes every 5 seconds for real-time tracking.">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, category, priority..."
              className="w-full md:flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-56 rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 transition"
            >
              <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="all">All</option>
              <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="pending">Pending</option>
              <option className="bg-slate-700 text-slate-100 hover:bg-blue-500" value="resolved">Resolved</option>
            </select>
          </div>

          {filteredComplaints.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No complaints submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Priority</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4 max-w-[200px]">Admin reply</th>
                    <th className="py-2 pr-4">Submitted</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2 pr-4">Image</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-indigo-50/40 dark:hover:bg-slate-700/60 transition">
                      <td className="py-3 pr-4 text-slate-700 dark:text-slate-100">{complaint.title}</td>
                      <td className="py-3 pr-4 capitalize text-slate-700 dark:text-slate-100">{complaint.category}</td>
                      <td className="py-3 pr-4 capitalize text-slate-700 dark:text-slate-100">{complaint.priority}</td>
                      <td className="py-3 pr-4">
                        <span className={getStatusBadgeClass(complaint.status)}>
                          {complaint.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4 max-w-[200px] text-slate-600 dark:text-slate-300">
                        {complaint.admin_response ? (
                          <span className="line-clamp-2" title={complaint.admin_response}>
                            {complaint.admin_response}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {new Date(complaint.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {complaint.updated_at
                          ? new Date(complaint.updated_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {complaint.image_url ? (
                          <a
                            href={complaint.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-blue-400 hover:text-indigo-800 dark:hover:text-blue-300 font-medium transition-colors"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3">
                        {complaint.status === "pending" ? (
                          <button
                            type="button"
                            disabled={deletingId === complaint.id}
                            onClick={() => handleDelete(complaint.id)}
                            className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                          >
                            {deletingId === complaint.id ? "Deleting…" : "Delete"}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredComplaints.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredComplaints.length)} of{" "}
                {filteredComplaints.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>
      </section>
    </DashboardLayout>
  );
}

export default UserDashboard;
