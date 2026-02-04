import React, { useState, useEffect } from "react";
import { adminApi } from "../../api";
import Sidebar from "../../components/common/Sidebar";
import SarvarthLogo from "../../components/common/SarvarthLogo";
import SarvarthLogoIcon from "../../components/common/SarvarthLogoIcon";
import "../../styles/pages/admin.css";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role_id: 2,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    username: "",
    role_id: 2,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createUser(formData);
      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role_id: 2,
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await adminApi.updateUser(selectedUser.id, editFormData);
      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({ name: "", email: "", username: "", role_id: 2 });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.deleteUser(selectedUser.id);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <>
      <Sidebar isAdmin={true} />
      <main className="main-content">
        <div className="page-container">
          <header className="page-header">
            <h1 className="page-title">Dashboard ADMIN</h1>
          </header>

          <section className="recents-section">
            <h2 className="recents-title">Recents</h2>
            <div className="recents-buttons">
              <button
                className="create-button"
                onClick={() => setShowModal(true)}
              >
                Create +
              </button>
            </div>
          </section>

          <div className="admin-table-container">
            {loading ? (
              <div className="flex-center" style={{ padding: "40px" }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role_name}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#3b82f6",
                            }}
                            onClick={() => handleEditClick(user)}
                            title="Edit user"
                          >
                            {/* Edit Icon */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                            }}
                            onClick={() => handleDeleteClick(user)}
                            title="Delete user"
                          >
                            {/* Delete Icon */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content create-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Create User</h2>
            <div className="modal-logo">
              <div className="modal-logo-icon">
                <SarvarthLogoIcon size="xl" />
              </div>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="modal-input"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                className="modal-input"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="modal-input"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              <input
                type="password"
                className="modal-input"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <select
                className="modal-select"
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role_id: parseInt(e.target.value),
                  })
                }
              >
                <option value={2}>User</option>
                <option value={1}>Admin</option>
              </select>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content create-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Edit User</h2>
            <div className="modal-logo">
              <div className="modal-logo-icon">
                <SarvarthLogoIcon size="xl" />
              </div>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <input
                type="text"
                className="modal-input"
                placeholder="Name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                className="modal-input"
                placeholder="Email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                className="modal-input"
                placeholder="Username"
                value={editFormData.username}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    username: e.target.value,
                  })
                }
                required
              />
              <select
                className="modal-select"
                value={editFormData.role_id}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    role_id: parseInt(e.target.value),
                  })
                }
              >
                <option value={2}>User</option>
                <option value={1}>Admin</option>
              </select>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content create-user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Delete User</h2>
            <div className="modal-logo">
              <div className="modal-logo-icon">
                <SarvarthLogoIcon size="xl" />
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                fontSize: "16px",
                color: "#333",
              }}
            >
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedUser?.name}</strong>?
              </p>
              <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-submit"
                style={{ backgroundColor: "#ef4444" }}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
