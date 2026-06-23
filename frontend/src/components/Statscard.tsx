interface StatsCardsProps {
    total: number;
    pending: number;
    processed: number;
    failed: number;
    onCardClick?: (label: string) => void;
    selectedCard?: string;
}

// ─── SVG Icons ──────────────────────────────────────────────────────────

const ReceiptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
        <path d="M16 8H8" />
        <path d="M16 12H8" />
        <path d="M13 16H8" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

import StatsCardWrapper from "./dashboard/StatsCardWrapper";

export default function StatsCards({
    total,
    pending,
    processed,
    failed,
    onCardClick,
    selectedCard,
}: StatsCardsProps) {
    const cards = [
        {
            label: "Total Invoices",
            value: total,
            variant: "success" as const,
            iconBg: "#DCFCE7",
            iconColor: "#16A34A",
            icon: <ReceiptIcon />
        },
        {
            label: "Pending",
            value: pending,
            variant: "warning" as const,
            iconBg: "#FEF3C7",
            iconColor: "#D97706",
            icon: <ClockIcon />
        },
        {
            label: "Processed",
            value: processed,
            variant: "success" as const,
            iconBg: "#DCFCE7",
            iconColor: "#16A34A",
            icon: <CheckCircleIcon />
        },
        {
            label: "Failed",
            value: failed,
            variant: "danger" as const,
            iconBg: "#FEE2E2",
            iconColor: "#DC2626",
            icon: <ErrorIcon />
        },
    ];

    return (
        <>
            <style>{`
            .stat-card-custom {
                transition: all 0.3s ease !important;
            }
            .stat-card-custom .stats-info .stats-label,
            .stat-card-custom .stats-info .stats-value {
                transition: color 0.3s ease;
            }
            
            /* Base Card styles to prevent layout jump on border change */
            .stat-card-custom {
                border: 2px solid transparent !important;
                transition: all 0.3s ease !important;
            }
            
            /* Success (Green) */
            .stat-card-custom.unselected-success {
                background-color: white !important;
                box-shadow: 0 0 15px rgba(16, 185, 129, 0.2) !important;
            }
            .stat-card-custom.unselected-success:hover,
            .stat-card-custom.selected-success {
                background-color: #DCFCE7 !important;
                border: 2px solid #16A34A !important;
                box-shadow: none !important;
            }
            
            /* Warning (Orange) */
            .stat-card-custom.unselected-warning {
                background-color: white !important;
                box-shadow: 0 0 15px rgba(245, 158, 11, 0.2) !important;
            }
            .stat-card-custom.unselected-warning:hover,
            .stat-card-custom.selected-warning {
                background-color: #FEF3C7 !important;
                border: 2px solid #D97706 !important;
                box-shadow: none !important;
            }
            
            /* Danger (Red) */
            .stat-card-custom.unselected-danger {
                background-color: white !important;
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.2) !important;
            }
            .stat-card-custom.unselected-danger:hover,
            .stat-card-custom.selected-danger {
                background-color: #FEE2E2 !important;
                border: 2px solid #DC2626 !important;
                box-shadow: none !important;
            }
            
            /* Text colors remain dark in all states */
            .stat-card-custom .stats-info .stats-label {
                color: #64748b !important;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .stat-card-custom .stats-info .stats-value {
                color: #0f172a !important;
            }
            
            /* Icon box transparent in all states */
            .stat-card-custom .stats-icon-box {
                background-color: transparent !important;
            }
            
            /* Icon colors based on variant */
            .stat-card-custom[class*="-success"] .stats-icon-box { color: #16A34A !important; }
            .stat-card-custom[class*="-warning"] .stats-icon-box { color: #D97706 !important; }
            .stat-card-custom[class*="-danger"] .stats-icon-box { color: #DC2626 !important; }
        `}</style>
            <div className="stats-grid" style={{ backgroundImage: "url('/statbg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', padding: '24px', borderRadius: '24px' }}>
                {cards.map((card, index) => {
                    const isSelected = selectedCard === card.label;
                    const customClass = `stat-card-custom ${isSelected ? 'selected' : 'unselected'}-${card.variant}`;
                    return (
                        <StatsCardWrapper
                            key={card.label}
                            isActive={isSelected}
                            onClick={() => onCardClick?.(card.label)}
                            delay={index * 100}
                            variant={card.variant}
                            className={customClass}
                        >
                            <div
                                style={{
                                    padding: "24px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    transition: "opacity 0.2s",
                                    height: "100%",
                                    boxSizing: "border-box"
                                }}
                            >
                                <div className="stats-info">
                                    <div className="stats-label">{card.label}</div>
                                    <div className="stats-value">{card.value}</div>
                                </div>
                                <div
                                    className="stats-icon-box"
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </StatsCardWrapper>
                    );
                })}
            </div>
        </>
    );
}