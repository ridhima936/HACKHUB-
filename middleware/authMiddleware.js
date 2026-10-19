const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const [scheme, token] = header.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Access denied. No token provided" });
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
