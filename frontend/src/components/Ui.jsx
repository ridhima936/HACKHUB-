import { useEffect } from "react";

export function Crest({ size = 44 }) {
    return (
        <svg className="crest" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
            <defs>
                <linearGradient id="crestGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f3dd91" />
                    <stop offset="1" stopColor="#b8892b" />
                </linearGradient>
            </defs>
            <path d="M32 4 56 12v20c0 14-10 24-24 28C18 56 8 46 8 32V12z" fill="#1a2552" stroke="url(#crestGold)" strokeWidth="3" />
            <path d="M22 20v24M42 20v24M22 32h20" stroke="url(#crestGold)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="32" cy="12" r="1.8" fill="#f3dd91" />
        </svg>
    );
}

export function Modal({ title, onClose, children, wide = false }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="modal-head">
                    <h3>{title}</h3>
                    <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
    return (
        <header className="page-header">
            <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="page-actions">{actions}</div>}
        </header>
    );
}

export function EmptyState({ icon = "✦", title, text, action }) {
    return (
        <div className="empty">
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            {text && <p>{text}</p>}
            {action}
        </div>
    );
}

export function Loading({ text = "Consulting the archives…", rows = 3 }) {
    return (
        <div className="loading" role="status">
            <p>{text}</p>
            <div className="skeleton-grid">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="skeleton" />
                ))}
            </div>
        </div>
    );
}
