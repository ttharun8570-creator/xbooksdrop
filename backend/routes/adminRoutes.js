const express = require("express");

const {
    getPendingBooks,
    approveBook,
    rejectBook,
    getAllBooksAdmin,
    deleteBookAdmin,
    getAllUsersAdmin,
    blockUserAdmin,
    unblockUserAdmin,
    getDashboardStats
} = require("../controllers/adminController");

const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Apply auth & admin check to all admin routes
router.use(authenticateToken, isAdmin);

// Stats
router.get("/stats", getDashboardStats);

// Books management
router.get("/books/pending", getPendingBooks);
router.get("/books", getAllBooksAdmin);
router.put("/books/:id/approve", approveBook);
router.put("/books/:id/reject", rejectBook);
router.delete("/books/:id", deleteBookAdmin);

// Users management
router.get("/users", getAllUsersAdmin);
router.put("/users/:id/block", blockUserAdmin);
router.put("/users/:id/unblock", unblockUserAdmin);

module.exports = router;