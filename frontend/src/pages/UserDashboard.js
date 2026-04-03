import React, { useEffect, useState } from "react";
import api from "../services/api";

function getStatusBadgeClass(status) {
  return `status-badge status-${status}`;
}

function UserDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      const response = await api.get("/complaints/my/");
      setComplaints(response.data);
    } catch (err) {
      setError("Failed to load complaints.");
    }
  };

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image) formData.append("image", image);

      await api.post("/complaints/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Complaint submitted successfully.");
      setTitle("");
      setDescription("");
      setImage(null);
      fetchComplaints();
    } catch (err) {
      setError("Could not submit complaint.");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h3 className="page-title">User Dashboard</h3>
          <p className="muted-note mb-0">Submit new complaints and track progress in real time.</p>
        </div>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card card-soft mb-4">
        <div className="card-header">Submit Complaint</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Image (optional)</label>
              <input className="form-control" type="file" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>

      <div className="card card-soft">
        <div className="card-header">My Complaints (auto refresh every 5s)</div>
        <div className="card-body">
          {complaints.length === 0 ? (
            <p className="mb-0">No complaints submitted yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.title}</td>
                    <td>
                      <span className={getStatusBadgeClass(complaint.status)}>
                        {complaint.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{new Date(complaint.created_at).toLocaleString()}</td>
                    <td>
                      {complaint.image_url ? (
                        <a href={complaint.image_url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
