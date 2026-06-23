import React from "react";
import { UserButton, useUser } from "@clerk/react";

interface SidebarProps {
  activeView: "dashboard" | "repository";
  onNavigate: (view: "dashboard" | "repository") => void;
  isOpen: boolean;
  onClose?: () => void;
}

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const RepoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3h6l3 3h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="12" y1="8" x2="12" y2="16" />
  </svg>
);

const ReceiptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2" />
    <path d="M16 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </svg>
);

export default function Sidebar({ activeView, onNavigate, isOpen, onClose }: SidebarProps) {
  const { user } = useUser();
  const userName = user?.username || user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "User";

  const navItems: { id: "dashboard" | "repository"; label: string; Icon: React.FC }[] = [
    { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
    { id: "repository", label: "Repository", Icon: RepoIcon },
  ];

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {onClose && (
            <button className="hamburger-btn" style={{ padding: 4 }} onClick={onClose} aria-label="Close sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 10px', marginTop: 12 }}>
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`sidebar-nav-${id}`}
              className={`sidebar-nav-item ${activeView === id ? "active" : ""}`}
              onClick={() => {
                onNavigate(id);
                if (onClose) onClose();
              }}
              title={label}
            >
              <span className="sidebar-nav-icon">
                <Icon />
              </span>
              <span className="sidebar-nav-label">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <UserButton appearance={{ elements: { userButtonAvatarBox: { width: 36, height: 36 } } }} afterSignOutUrl="/sign-in" />
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>Member</span>
        </div>
      </div>
    </aside>
  );
}
