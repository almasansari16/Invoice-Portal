"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import {
  IconAlert,
  IconCheckCircle,
  IconEye,
  IconEyeOff,
  IconKey,
  IconLock,
  IconRefresh,
  IconShield,
  IconUserCheck,
} from "@/components/Icons";

export type UserProfile = {
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

export default function ProfileSettings({ initialUser }: { initialUser: UserProfile }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(initialUser);

  // Edit Name state
  const [name, setName] = useState(initialUser.name);
  const [updatingName, setUpdatingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameMessage(null);
    setUpdatingName(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      setUpdatingName(false);

      if (!res.ok) {
        setNameMessage({ text: data.error || "Failed to update name", ok: false });
        return;
      }

      setUser((prev) => ({ ...prev, name: data.user.name }));
      setNameMessage({ text: "Profile name updated successfully!", ok: true });
      router.refresh();
    } catch (err: any) {
      setUpdatingName(false);
      setNameMessage({ text: err.message || "Failed to update profile", ok: false });
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ text: "New password must be at least 6 characters long", ok: false });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New password and confirmation do not match", ok: false });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({ text: "New password must be different from current password", ok: false });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      setChangingPassword(false);

      if (!res.ok) {
        setPasswordMessage({ text: data.error || "Failed to change password", ok: false });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({
        text: "Password changed successfully! Remember to use your new password for future logins.",
        ok: true,
      });
    } catch (err: any) {
      setChangingPassword(false);
      setPasswordMessage({ text: err.message || "Something went wrong", ok: false });
    }
  }

  const dateJoined = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">
            Manage your personal profile information and update your login password
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Avatar name={user.name} size="lg" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</h2>
              {user.role === "ADMIN" ? (
                <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>
                  <IconShield size={13} /> Administrator
                </span>
              ) : (
                <span className="badge" style={{ background: "#ecfdf5", color: "#047857" }}>
                  <IconUserCheck size={13} /> Staff Member
                </span>
              )}
            </div>

            <div style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 4 }}>
              Login Email: <b className="mono" style={{ color: "var(--ink)" }}>{user.email}</b>
            </div>

            <div style={{ color: "var(--subtle)", fontSize: 12.5, marginTop: 4 }}>
              Member since {dateJoined} &bull; {user._count?.invoices || 0} invoices created
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Form */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div className="section-title">
          <span className="icon-chip">
            <IconUserCheck size={16} />
          </span>
          <div>
            <h3>Profile Details</h3>
            <p>Your display name across invoices and system logs</p>
          </div>
        </div>

        <form onSubmit={handleUpdateName}>
          <div className="grid-2">
            <div className="field">
              <label>
                Full Name <span className="req">*</span>
              </label>
              <input
                className="input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Email Address / Login ID</label>
              <input
                className="input mono"
                type="email"
                disabled
                value={user.email}
                style={{ background: "var(--paper-sunken)", color: "var(--muted)", cursor: "not-allowed" }}
              />
              <span className="hint">Email ID can only be modified by the Administrator.</span>
            </div>
          </div>

          {nameMessage && (
            <div
              className={`alert ${nameMessage.ok ? "alert-success" : "alert-danger"}`}
              style={{ marginBottom: 16 }}
            >
              {nameMessage.ok ? <IconCheckCircle size={16} /> : <IconAlert size={16} />}
              {nameMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={updatingName || name.trim() === user.name}
          >
            {updatingName ? "Saving…" : "Save Name"}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="card card-pad">
        <div className="section-title">
          <span className="icon-chip" style={{ background: "#fef3c7", color: "#b45309" }}>
            <IconKey size={16} />
          </span>
          <div>
            <h3>Update Password</h3>
            <p>Ensure your account remains safe with a strong, private password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword}>
          <div className="field" style={{ maxWidth: 440 }}>
            <label>
              Current Password <span className="req">*</span>
            </label>
            <div className="input-group">
              <span className="adorn">
                <IconLock size={16} />
              </span>
              <input
                className="input mono"
                type={showCurrentPassword ? "text" : "password"}
                required
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                {showCurrentPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>
                  New Password <span className="req">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const pwd = generateRandomPassword();
                    setNewPassword(pwd);
                    setConfirmPassword(pwd);
                  }}
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
                  <IconRefresh size={12} /> Auto-generate
                </button>
              </div>
              <div className="input-group">
                <span className="adorn">
                  <IconKey size={16} />
                </span>
                <input
                  className="input mono"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                  {showNewPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>
                Confirm New Password <span className="req">*</span>
              </label>
              <div className="input-group">
                <span className="adorn">
                  <IconKey size={16} />
                </span>
                <input
                  className="input mono"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`alert ${passwordMessage.ok ? "alert-success" : "alert-danger"}`}
              style={{ marginBottom: 16 }}
            >
              {passwordMessage.ok ? <IconCheckCircle size={16} /> : <IconAlert size={16} />}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
          >
            {changingPassword ? "Updating Password…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
