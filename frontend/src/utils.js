export const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Open";

export const daysLeft = (value) => {
    if (!value) return null;
    return Math.ceil((new Date(value) - new Date()) / 86400000);
};

export const initial = (text) => (text || "?").trim().charAt(0).toUpperCase();
