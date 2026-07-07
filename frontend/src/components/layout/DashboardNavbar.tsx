import { useNavigate } from "react-router-dom";
import { ReceiptIcon } from "../Icons";

interface DashboardNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function DashboardNavbar({ onToggleSidebar }: DashboardNavbarProps) {
  const navigate = useNavigate();

  return (
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '64px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar" style={{ padding: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="logo-icon-box" style={{ 
              width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent) 0%, #047857 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0
            }}>
                <ReceiptIcon />
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-h)' }}>
                Invoice<span className="logo-text-accent" style={{ color: 'var(--accent)' }}>OCR</span>
            </span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outlined" 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
          title="Back to Homepage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>Home</span>
        </button>
      </div>
    </header>
  );
}
