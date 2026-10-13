"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import {
  IconAlert,
  IconCheck,
  IconCheckCircle,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconKey,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShield,
  IconTrash,
  IconUserCheck,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@/components/Icons";

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    invoices: number;
  };
};

export default function UserManagement({
  initialUsers,
  currentUserId,
}: {
  initialUsers: SystemUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF">("ALL");

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Created user credentials box state
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccessCredentials, setResetSuccessCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // Delete User State
  const [deleteModalUser, setDeleteModalUser] = useState<SystemUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Feedback toast
  const [toastMessage, setToastMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  }

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });

      const data = await res.json();
      setCreating(false);

      if (!res.ok) {
        setCreateError(data.error || "Failed to create user");
        return;
      }

      setUsers([data.user, ...users]);
      setCreatedCredentials({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });

      // Clear input fields
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("STAFF");
      showToast("User account created successfully!");
      router.refresh();
    } catch (err: any) {
      setCreating(false);
      setCreateError(err.message || "Something went wrong");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser) return;
    setResetError("");
    setResetting(true);

    try {
      const res = await fetch(`/api/users/${resetModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      setResetting(false);

      if (!res.ok) {
        setResetError(data.error || "Failed to reset password");
        return;
      }

      setResetSuccessCredentials({
        email: resetModalUser.email,
        password: newPassword,
      });
      showToast("Password updated successfully!");
    } catch (err: any) {
      setResetting(false);
      setResetError(err.message || "Failed to reset password");
    }
  }

  async function handleToggleRole(user: SystemUser) {
    const newRole = user.role === "ADMIN" ? "STAFF" : "ADMIN";
    const confirmChange = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole === "ADMIN" ? "Administrator" : "Staff"}?`
    );
    if (!confirmChange) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update role");
        return;
      }

      setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      showToast(`User role updated to ${newRole}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  }

  async function handleDeleteUser() {
    if (!deleteModalUser) return;
    setDeleteError("");
    setDeleting(true);

    try {
      const res = await fetch(`/api/users/${deleteModalUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      setDeleting(false);

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete user");
        return;
      }

      setUsers(users.filter((u) => u.id !== deleteModalUser.id));
      setDeleteModalUser(null);
      showToast("User account deleted");
      router.refresh();
    } catch (err: any) {
      setDeleting(false);
      setDeleteError(err.message || "Failed to delete user");
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;

  return (
    <div>
      {/* Top action bar */}
      <div className="topbar">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            Create user accounts, distribute login credentials, and manage roles
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setCreatedCredentials(null);
              setCreateError("");
              setFormPassword(generateRandomPassword());
              setCreateModalOpen(true);
            }}
          >
            <IconUserPlus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Users</span>
            <div className="stat-icon" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
              <IconUsers size={18} />
            </div>
          </div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-foot">Registered system accounts</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span className="stat-label">Administrators</span>
            <div className="stat-icon" style={{ background: "#ede9fe", color: "#6d28d9" }}>
              <IconShield size={18} />
            </div>
          </div>
          <div className="stat-value">{adminCount}</div>
          <div className="stat-foot">Full access &amp; user control</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span className="stat-label">Staff Members</span>
            <div className="stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <IconUserCheck size={18} />
            </div>
          </div>
          <div className="stat-value">{staffCount}</div>
          <div className="stat-foot">Invoicing &amp; Customer operations</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="input-group" style={{ maxWidth: 360, width: "100%" }}>
          <span className="adorn">
            <IconSearch size={16} />
          </span>
          <input
            className="input"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="segmented">
          <button
            type="button"
            className={roleFilter === "ALL" ? "on" : ""}
            onClick={() => setRoleFilter("ALL")}
          >
            All Users <span className="count">{users.length}</span>
          </button>
          <button
            type="button"
            className={roleFilter === "ADMIN" ? "on" : ""}
            onClick={() => setRoleFilter("ADMIN")}
          >
            Admins <span className="count">{adminCount}</span>
          </button>
          <button
            type="button"
            className={roleFilter === "STAFF" ? "on" : ""}
            onClick={() => setRoleFilter("STAFF")}
          >
            Staff <span className="count">{staffCount}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Invoices Created</th>
                <th>Account Created</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ color: "var(--muted)", fontSize: 14 }}>
                      No users match your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  const dateStr = new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="cell-person">
                          <Avatar name={user.name} />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <b style={{ color: "var(--ink)", fontSize: 14 }}>{user.name}</b>
                              {isCurrent && (
                                <span
                                  className="tag"
                                  style={{
                                    background: "var(--brand-soft)",
                                    color: "var(--brand)",
                                    borderColor: "transparent",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 2,
                              }}
                            >
                              <span className="mono" style={{ color: "var(--muted)" }}>
                                {user.email}
                              </span>
                              <button
                                type="button"
                                title="Copy Email ID"
                                onClick={() => handleCopy(user.email, `email-${user.id}`)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 2,
                                  cursor: "pointer",
                                  color: copiedKey === `email-${user.id}` ? "var(--success)" : "var(--subtle)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                {copiedKey === `email-${user.id}` ? <IconCheck size={13} /> : <IconCopy size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.role === "ADMIN" ? (
                          <span
                            className="badge"
                            style={{ background: "#ede9fe", color: "#6d28d9" }}
                          >
                            <span className="dot" />
                            Administrator
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{ background: "#ecfdf5", color: "#047857" }}
                          >
                            <span className="dot" />
                            Staff Member
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="num" style={{ fontWeight: 600 }}>
                          {user._count?.invoices || 0}
                        </span>{" "}
                        <span className="sub">invoices</span>
                      </td>
                      <td>
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>{dateStr}</span>
                      </td>
                      <td className="right">
                        <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Reset Password for this user"
                            onClick={() => {
                              setResetSuccessCredentials(null);
                              setResetError("");
                              setNewPassword(generateRandomPassword());
                              setResetModalUser(user);
                            }}
                          >
                            <IconKey size={14} /> Reset Password
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title={`Switch role to ${user.role === "ADMIN" ? "Staff" : "Admin"}`}
                            disabled={isCurrent && adminCount <= 1}
                            onClick={() => handleToggleRole(user)}
                          >
                            <IconShield size={14} /> Toggle Role
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm btn-icon"
                              title="Delete user"
                              onClick={() => {
                                setDeleteError("");
                                setDeleteModalUser(user);
                              }}
                            >
                              <IconTrash size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="icon-chip" style={{ width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--brand-soft)", color: "var(--brand)" }}>
                  <IconUserPlus size={16} />
                </span>
                <h3 style={{ margin: 0 }}>Add New User</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setCreateModalOpen(false)}
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="modal-body">
              {createdCredentials ? (
                <div>
                  <div
                    className="alert alert-success"
                    style={{ marginBottom: 18, alignItems: "center" }}
                  >
                    <IconCheckCircle size={18} />
                    <div>
                      <b>User Account Created Successfully!</b>
                      <div style={{ fontSize: 12.5, marginTop: 2 }}>
                        Share these login credentials with the user. They can change their password later from their profile.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--paper-sunken)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        User Name
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{createdCredentials.name}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                          Login Email / ID
                        </div>
                        <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>
                          {createdCredentials.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy(createdCredentials.email, "created-email")}
                      >
                        {copiedKey === "created-email" ? <IconCheck size={14} /> : <IconCopy size={14} />} Copy
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                          Password
                        </div>
                        <div className="mono" style={{ fontWeight: 700, fontSize: 15, color: "var(--brand)" }}>
                          {createdCredentials.password}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy(createdCredentials.password, "created-pwd")}
                      >
                        {copiedKey === "created-pwd" ? <IconCheck size={14} /> : <IconCopy size={14} />} Copy
                      </button>
                    </div>

                    <div className="divider" style={{ margin: "6px 0" }} />

                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={() => {
                        const info = `Invoicing Software Login Credentials:\nEmail / ID: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nRole: ${createdCredentials.role}\n(Please change your password after logging in)`;
                        handleCopy(info, "copy-all");
                      }}
                    >
                      {copiedKey === "copy-all" ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      Copy Complete Credentials
                    </button>
                  </div>

                  <div style={{ marginTop: 18, textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setCreatedCredentials(null);
                        setCreateModalOpen(false);
                      }}
                    >
                      Done &amp; Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateUser}>
                  <div className="field">
                    <label>
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      required
                      placeholder="e.g. Ali Raza"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>
                      Email Address (Login ID) <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      type="email"
                      required
                      placeholder="e.g. ali@company.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                    <span className="hint">This email will be used as their login ID.</span>
                  </div>

                  <div className="field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>
                        Password <span className="req">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormPassword(generateRandomPassword())}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--brand)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <IconRefresh size={12} /> Generate Strong
                      </button>
                    </div>

                    <div className="input-group">
                      <input
                        className="input mono"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        style={{ paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          background: "none",
                          border: "none",
                          color: "var(--muted)",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="field" style={{ marginBottom: 18 }}>
                    <label>Assigned Role</label>
                    <select
                      className="input"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as "ADMIN" | "STAFF")}
                    >
                      <option value="STAFF">Staff (Create &amp; Manage Invoices and Customers)</option>
                      <option value="ADMIN">Administrator (Full Access &amp; User Management)</option>
                    </select>
                  </div>

                  {createError && (
                    <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                      <IconAlert size={16} /> {createError}
                    </div>
                  )}

                  <div className="modal-foot" style={{ margin: "-22px -22px -22px", marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCreateModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={creating}>
                      {creating ? "Creating Account…" : "Create User Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="modal-backdrop" onClick={() => setResetModalUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="icon-chip" style={{ width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", background: "#fef3c7", color: "#b45309" }}>
                  <IconKey size={16} />
                </span>
                <h3 style={{ margin: 0 }}>Reset Password</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setResetModalUser(null)}
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="modal-body">
              {resetSuccessCredentials ? (
                <div>
                  <div className="alert alert-success" style={{ marginBottom: 16 }}>
                    <IconCheckCircle size={18} />
                    <div>
                      <b>Password Reset Successfully!</b>
                      <div style={{ fontSize: 12.5, marginTop: 2 }}>
                        Share this updated password with <b>{resetModalUser.name}</b>.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--paper-sunken)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        User
                      </div>
                      <div style={{ fontWeight: 600 }}>{resetModalUser.name} ({resetModalUser.email})</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                          New Password
                        </div>
                        <div className="mono" style={{ fontWeight: 700, fontSize: 15, color: "var(--brand)" }}>
                          {resetSuccessCredentials.password}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCopy(resetSuccessCredentials.password, "reset-pwd")}
                      >
                        {copiedKey === "reset-pwd" ? <IconCheck size={14} /> : <IconCopy size={14} />} Copy
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 18, textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setResetModalUser(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p style={{ color: "var(--muted)", marginBottom: 16, fontSize: 13.5 }}>
                    Set a new password for <b>{resetModalUser.name}</b> ({resetModalUser.email}).
                  </p>

                  <div className="field">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>
                        New Password <span className="req">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewPassword(generateRandomPassword())}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--brand)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <IconRefresh size={12} /> Generate
                      </button>
                    </div>

                    <div className="input-group">
                      <input
                        className="input mono"
                        type={showResetPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          background: "none",
                          border: "none",
                          color: "var(--muted)",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {showResetPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {resetError && (
                    <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                      <IconAlert size={16} /> {resetError}
                    </div>
                  )}

                  <div className="modal-foot" style={{ margin: "-22px -22px -22px", marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setResetModalUser(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={resetting}>
                      {resetting ? "Updating…" : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div className="modal-backdrop" onClick={() => setDeleteModalUser(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{ margin: 0, color: "var(--danger)" }}>Delete User Account</h3>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setDeleteModalUser(null)}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "var(--ink)", marginBottom: 12 }}>
                Are you sure you want to delete the user account for <b>{deleteModalUser.name}</b> (
                {deleteModalUser.email})?
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
                This user will no longer be able to log in to the software. Existing invoices created by this user will be preserved.
              </p>

              {deleteError && (
                <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                  <IconAlert size={16} /> {deleteError}
                </div>
              )}

              <div className="modal-foot" style={{ margin: "-22px -22px -22px", marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteModalUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={deleting}
                  onClick={handleDeleteUser}
                >
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toastMessage && (
        <div className="toast">
          <IconCheckCircle size={16} style={{ color: "#34d399" }} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
