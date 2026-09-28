import { STATUS_LABELS, STATUS_TONES } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] || STATUS_TONES.DRAFT;
  return (
    <span className="badge" style={{ background: tone.bg, color: tone.fg }}>
      <span className="dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const AVATAR_TONES = [
  ["#eef2ff", "#3b5bdb"],
  ["#ecfdf5", "#047857"],
  ["#fff7ed", "#c2410c"],
  ["#fdf2f8", "#be185d"],
  ["#f0f9ff", "#0369a1"],
  ["#f5f3ff", "#6d28d9"],
  ["#fefce8", "#a16207"],
];

export function Avatar({ name, size }: { name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [bg, fg] = AVATAR_TONES[hash % AVATAR_TONES.length];
  return (
    <span className={`avatar ${size || ""}`} style={{ background: bg, color: fg }}>
      {initials || "?"}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
