import React from "react";

interface NavbarProps {
    currentUser: {
        name: string;
        role: string;
        initials: string;
    };

    profileOpen: boolean;
    setProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;

    profileRef: React.RefObject<HTMLDivElement | null>;

    onLogout: () => void;
}

const ReceiptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2" />
        <path d="M16 8H8" />
        <path d="M16 12H8" />
        <path d="M13 16H8" />
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

export default function Navbar({
    currentUser,
    profileOpen,
    setProfileOpen,
    profileRef,
    onLogout,
}: NavbarProps) {
    return (
        <header className="navbar">
            <div className="navbar-container">
                <a href="#" className="logo-section">
                    <span className="logo-icon-box">
                        <ReceiptIcon />
                    </span>
                    <span>
                        Invoice<span className="logo-text-accent">OCR</span>
                    </span>
                </a>

                <div className="navbar-actions">
                    <button className="notification-btn">
                        <BellIcon />
                    </button>

                    <div className="divider-vertical"></div>

                    <div
                        ref={profileRef}
                        className={`profile-widget ${profileOpen ? "active" : ""}`}
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        <div className="avatar">{currentUser.initials}</div>

                        <div className="profile-info">
                            <span className="profile-name">{currentUser.name}</span>
                            <span className="profile-role">{currentUser.role}</span>
                        </div>

                        <ChevronDownIcon className="chevron-icon" />

                        {profileOpen && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item">
                                    My Profile
                                </button>

                                <button className="dropdown-item">
                                    Preferences
                                </button>

                                <button
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLogout();
                                    }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}