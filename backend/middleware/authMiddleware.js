const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "my_secret_key";

const authenticateToken = async (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access token is required"
            });
        }

        // Expected format: Bearer TOKEN
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        const token = parts[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token format"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user is blocked or deleted in database
        const userResult = await pool.query(
            "SELECT user_id, role, is_blocked FROM users WHERE user_id = $1",
            [decoded.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                message: "User account no longer exists"
            });
        }

        if (userResult.rows[0].is_blocked) {
            return res.status(403).json({
                message: "Your account has been blocked. Please contact support."
            });
        }

        // Keep decoded token info and latest role
        req.user = {
            ...decoded,
            role: userResult.rows[0].role
        };

        // Continue to next middleware/controller
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticateToken;