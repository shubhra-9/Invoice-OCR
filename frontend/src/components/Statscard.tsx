interface StatsCardsProps {
    total: number;
    pending: number;
    processed: number;
    failed: number;
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

export default function StatsCards({
    total,
    pending,
    processed,
    failed,
}: StatsCardsProps) {
    const cards = [
        { label: "Total Invoices", value: total, classAccent: "stats-total", icon: <ReceiptIcon /> },
        { label: "Pending", value: pending, classAccent: "stats-pending", icon: <ClockIcon /> },
        { label: "Processed", value: processed, classAccent: "stats-successful", icon: <CheckCircleIcon /> },
        { label: "Failed", value: failed, classAccent: "stats-failed", icon: <ErrorIcon /> },
    ];

    return (
        <div className="stats-grid">
            {cards.map((card) => (
                <div key={card.label} className={`glass-card stats-card ${card.classAccent}`}>
                    <div className="stats-info">
                        <div className="stats-label">{card.label}</div>
                        <div className="stats-value">{card.value}</div>
                    </div>
                    <div className="stats-icon-box">
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}