const express = require("express");
const {
    getAllCategories,
    createCategory
} = require("../controllers/categoryController");
const authenticateToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// Public: Get all categories
router.get("/", getAllCategories);

// Admin: Add a new category
router.post("/", authenticateToken, isAdmin, createCategory);

module.exports = router;
