import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    User,
    Shield,
    Check,
    AlertCircle,
    Mail,
    UserCog,
} from 'lucide-react';
import './AdminUsers.css';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role_id: number;
    role_name: string;
    is_active: boolean;
    created_at: string;
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role_id: 2,
        is_active: true,
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await adminApi.getUsers();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterRole === 'all' || user.role_name === filterRole;
        return matchesSearch && matchesFilter;
    });

    const resetForm = () => {
        setFormData({
            name: '',
            username: '',
            email: '',
            password: '',
            role_id: 2,
            is_active: true,
        });
        setFormError('');
    };

    const handleCreate = async () => {
        const { name, username, email, password, role_id } = formData;

        if (!name || !username || !email || !password) {
            setFormError('All fields are required');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            await adminApi.createUser({ name, username, email, password, role_id });
            await fetchUsers();
            setShowCreateModal(false);
            resetForm();
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;

        const updateData: any = {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            role_id: formData.role_id,
            is_active: formData.is_active,
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        setSubmitting(true);
        setFormError('');

        try {
            await adminApi.updateUser(selectedUser.id, updateData);
            await fetchUsers();
            setShowEditModal(false);
            setSelectedUser(null);
            resetForm();
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        setSubmitting(true);

        try {
            await adminApi.deleteUser(selectedUser.id);
            await fetchUsers();
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            password: '',
            role_id: user.role_id,
            is_active: user.is_active,
        });
        setFormError('');
        setShowEditModal(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    return (
        <div className="admin-users-page">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system users and their roles</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterRole === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterRole('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`}
                        onClick={() => setFilterRole('admin')}
                    >
                        Admins
                    </button>
                    <button
                        className={`filter-btn ${filterRole === 'user' ? 'active' : ''}`}
                        onClick={() => setFilterRole('user')}
                    >
                        Users
                    </button>
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="card">
                    <div className="skeleton" style={{ height: '400px' }} />
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="card users-table-card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{user.name}</span>
                                                    <span className="user-username">@{user.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="user-email">{user.email}</span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${user.role_name === 'admin'
                                                        ? 'badge-primary'
                                                        : 'badge-info'
                                                    }`}
                                            >
                                                {user.role_name === 'admin' ? (
                                                    <>
                                                        <Shield size={12} />
                                                        Admin
                                                    </>
                                                ) : (
                                                    <>
                                                        <User size={12} />
                                                        User
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${user.is_active ? 'badge-success' : 'badge-error'
                                                    }`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => openEditModal(user)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => openDeleteModal(user)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="empty-state card">
                    <Users size={64} />
                    <h3>No users found</h3>
                    <p>
                        {searchTerm || filterRole !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Create your first user to get started'}
                    </p>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create New User</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {formError && (
                                <div className="alert alert-error">
                                    <AlertCircle size={20} />
                                    {formError}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter username"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select form-input"
                                    value={formData.role_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role_id: parseInt(e.target.value) })
                                    }
                                >
                                    <option value={2}>User</option>
                                    <option value={1}>Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={submitting}
                            >
                                {submitting ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedUser && (
                <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Edit User</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowEditModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {formError && (
                                <div className="alert alert-error">
                                    <AlertCircle size={20} />
                                    {formError}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, username: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    New Password (leave blank to keep current)
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select form-input"
                                    value={formData.role_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role_id: parseInt(e.target.value) })
                                    }
                                >
                                    <option value={2}>User</option>
                                    <option value={1}>Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select form-input"
                                    value={formData.is_active ? 'active' : 'inactive'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_active: e.target.value === 'active',
                                        })
                                    }
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpdate}
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedUser && (
                <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete User</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to delete user{' '}
                                <strong>{selectedUser.name}</strong> ({selectedUser.email})?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                {submitting ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
