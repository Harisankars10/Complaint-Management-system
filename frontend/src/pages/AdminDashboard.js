import React, { useEffect, useState } from "react";
import api from "../services/api";

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
        api.get("/complaints/admin/all/"),
      ]);
      setSummary(summaryRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      setError("Failed to load admin dashboard data.");
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
      setError("Unable to update status.");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h3 className="page-title">Admin Dashboard</h3>
          <p className="muted-note mb-0">Monitor all complaints and update statuses quickly.</p>
        </div>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card summary-card text-bg-primary">
            <div className="card-body">
              <div className="summary-label">Total Complaints</div>
              <div className="summary-value">{summary.total}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card summary-card text-bg-warning">
            <div className="card-body">
              <div className="summary-label">Pending</div>
              <div className="summary-value">{summary.pending}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card summary-card text-bg-info">
            <div className="card-body">
              <div className="summary-label">In Progress</div>
              <div className="summary-value">{summary.in_progress}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card summary-card text-bg-success">
            <div className="card-body">
              <div className="summary-label">Resolved</div>
              <div className="summary-value">{summary.resolved}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card card-soft">
        <div className="card-header">All Complaints (auto refresh every 5s)</div>
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>{complaint.user}</td>
                  <td>{complaint.title}</td>
                  <td>{complaint.description}</td>
                  <td>
                    <span className={getStatusBadgeClass(complaint.status)}>
                      {complaint.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
