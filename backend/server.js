const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/database");
const bookRoutes = require("./routes/bookRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static uploaded files & frontend assets
app.use("/uploads", express.static("uploads"));
app.use(express.static("public"));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Health check & Frontend entrypoint
app.get("/", (req, res) => {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.sendFile(path.join(__dirname, "public", "index.html"));
    }
    res.status(200).json({
        status: "OK",
        message: "Student Book Marketplace Backend is running!"
    });
});

// Database connectivity check
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            message: "Database connected successfully!",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Global 404 handler for unknown API routes / assets
app.use((req, res) => {
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.sendFile(path.join(__dirname, "public", "index.html"));
    }
    res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (err.name === "MulterError") {
        return res.status(400).json({
            message: `File upload error: ${err.message}`
        });
    }
    res.status(500).json({
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});