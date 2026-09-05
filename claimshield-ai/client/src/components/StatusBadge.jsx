import { CheckCircle2, XCircle, AlertTriangle, AlertCircle, Clock } from "lucide-react";

const STATUS_MAP = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    text: "text-status-approved",
    bg: "bg-status-approvedBg",
    ring: "ring-status-approved/20",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    text: "text-status-rejected",
    bg: "bg-status-rejectedBg",
    ring: "ring-status-rejected/20",
  },
  REQUEST_INFORMATION: {
    label: "Request Information",
    icon: AlertCircle,
    text: "text-status-info",
    bg: "bg-status-infoBg",
    ring: "ring-status-info/20",
  },
  ESCALATE: {
    label: "Escalated",
    icon: AlertTriangle,
    text: "text-status-escalated",
    bg: "bg-status-escalatedBg",
    ring: "ring-status-escalated/20",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    icon: Clock,
    text: "text-status-review",
    bg: "bg-status-reviewBg",
    ring: "ring-status-review/20",
  },
  Complete: {
    label: "Complete",
    icon: CheckCircle2,
    text: "text-status-approved",
    bg: "bg-status-approvedBg",
    ring: "ring-status-approved/20",
  },
  Incomplete: {
    label: "Incomplete",
    icon: AlertCircle,
    text: "text-status-info",
    bg: "bg-status-infoBg",
    ring: "ring-status-info/20",
  },
};

export default function StatusBadge({ status, size = "md" }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.UNDER_REVIEW;
  const Icon = cfg.icon;
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring} ${sizeClasses}`}
    >
      <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}
