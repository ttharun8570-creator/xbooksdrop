const pool = require("../config/database");

// Get all book categories
const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT category_id, name, description
             FROM categories
             ORDER BY name ASC`
        );

        res.status(200).json({
            categories: result.rows
        });
    } catch (error) {
        console.error("Get categories error:", error.message);

        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};

// Create a new category (Admin only)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existing = await pool.query(
            "SELECT * FROM categories WHERE LOWER(name) = LOWER($1)",
            [name.trim()]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO categories (name, description)
             VALUES ($1, $2)
             RETURNING *`,
            [name.trim(), description ? description.trim() : null]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: result.rows[0]
        });
    } catch (error) {
        console.error("Create category error:", error.message);

        res.status(500).json({
            message: "Failed to create category"
        });
    }
};

module.exports = {
    getAllCategories,
    createCategory
};
