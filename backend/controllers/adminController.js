const pool = require("../config/database");

// Get all pending books awaiting approval
const getPendingBooks = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                books.*,
                categories.name AS category_name,
                users.name AS seller_name,
                users.email AS seller_email,
                users.college_name AS seller_college,
                (
                    SELECT image_url
                    FROM book_images
                    WHERE book_images.book_id = books.book_id
                    ORDER BY is_primary DESC, created_at ASC
                    LIMIT 1
                ) AS image_url
             FROM books
             LEFT JOIN categories ON books.category_id = categories.category_id
             JOIN users ON books.seller_id = users.user_id
             WHERE books.status = 'PENDING'
             ORDER BY books.created_at ASC`
        );

        res.status(200).json({
            books: result.rows
        });

    } catch (error) {
        console.error("Get pending books error:", error.message);

        res.status(500).json({
            message: "Failed to fetch pending books"
        });
    }
};

// Approve a pending book
const approveBook = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE books
             SET status = 'APPROVED',
                 admin_note = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE book_id = $1
               AND status = 'PENDING'
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pending book not found"
            });
        }

        res.status(200).json({
            message: "Book approved successfully",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Approve book error:", error.message);

        res.status(500).json({
            message: "Failed to approve book"
        });
    }
};

// Reject a pending book with an admin note
const rejectBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note } = req.body;

        const result = await pool.query(
            `UPDATE books
             SET status = 'REJECTED',
                 admin_note = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE book_id = $2
               AND status = 'PENDING'
             RETURNING *`,
            [admin_note || "Listing does not meet marketplace guidelines.", id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pending book not found"
            });
        }

        res.status(200).json({
            message: "Book rejected successfully",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Reject book error:", error.message);

        res.status(500).json({
            message: "Failed to reject book"
        });
    }
};

// Get all books for admin overview (all statuses)
const getAllBooksAdmin = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = `
            SELECT
                books.*,
                categories.name AS category_name,
                users.name AS seller_name,
                users.email AS seller_email,
                (
                    SELECT image_url
                    FROM book_images
                    WHERE book_images.book_id = books.book_id
                    ORDER BY is_primary DESC, created_at ASC
                    LIMIT 1
                ) AS image_url
            FROM books
            LEFT JOIN categories ON books.category_id = categories.category_id
            JOIN users ON books.seller_id = users.user_id
            WHERE 1=1
        `;
        const values = [];
        let index = 1;

        if (status) {
            query += ` AND books.status = $${index}`;
            values.push(status.toUpperCase());
            index++;
        }

        if (search) {
            query += ` AND (LOWER(books.title) LIKE LOWER($${index}) OR LOWER(books.author) LIKE LOWER($${index}))`;
            values.push(`%${search}%`);
            index++;
        }

        query += ` ORDER BY books.created_at DESC`;

        const result = await pool.query(query, values);

        res.status(200).json({
            books: result.rows
        });
    } catch (error) {
        console.error("Get all books admin error:", error.message);
        res.status(500).json({
            message: "Failed to fetch books for admin"
        });
    }
};

// Delete any book as Admin
const deleteBookAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete associated book images first
        await pool.query("DELETE FROM book_images WHERE book_id = $1", [id]);

        const result = await pool.query(
            "DELETE FROM books WHERE book_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully by admin",
            book: result.rows[0]
        });
    } catch (error) {
        console.error("Admin delete book error:", error.message);
        res.status(500).json({
            message: "Failed to delete book"
        });
    }
};

// Get all users for admin management
const getAllUsersAdmin = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                u.user_id,
                u.name,
                u.email,
                u.college_name,
                u.college_id,
                u.phone,
                u.profile_photo_url,
                u.role,
                u.is_verified,
                u.is_blocked,
                u.created_at,
                COUNT(b.book_id) AS total_books
             FROM users u
             LEFT JOIN books b ON u.user_id = b.seller_id
             GROUP BY u.user_id
             ORDER BY u.created_at DESC`
        );

        res.status(200).json({
            users: result.rows
        });
    } catch (error) {
        console.error("Get all users admin error:", error.message);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

// Block user
const blockUserAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE users
             SET is_blocked = true,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1
             RETURNING user_id, name, email, role, is_blocked`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User blocked successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Block user error:", error.message);
        res.status(500).json({
            message: "Failed to block user"
        });
    }
};

// Unblock user
const unblockUserAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE users
             SET is_blocked = false,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1
             RETURNING user_id, name, email, role, is_blocked`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User unblocked successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Unblock user error:", error.message);
        res.status(500).json({
            message: "Failed to unblock user"
        });
    }
};

// Get Admin dashboard overview statistics
const getDashboardStats = async (req, res) => {
    try {
        const [usersCount, booksCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
            pool.query("SELECT COUNT(*) AS total FROM users"),
            pool.query("SELECT COUNT(*) AS total FROM books"),
            pool.query("SELECT COUNT(*) AS total FROM books WHERE status = 'PENDING'"),
            pool.query("SELECT COUNT(*) AS total FROM books WHERE status = 'APPROVED'"),
            pool.query("SELECT COUNT(*) AS total FROM books WHERE status = 'REJECTED'")
        ]);

        res.status(200).json({
            stats: {
                total_users: parseInt(usersCount.rows[0].total),
                total_books: parseInt(booksCount.rows[0].total),
                pending_books: parseInt(pendingCount.rows[0].total),
                approved_books: parseInt(approvedCount.rows[0].total),
                rejected_books: parseInt(rejectedCount.rows[0].total)
            }
        });
    } catch (error) {
        console.error("Admin stats error:", error.message);
        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getPendingBooks,
    approveBook,
    rejectBook,
    getAllBooksAdmin,
    deleteBookAdmin,
    getAllUsersAdmin,
    blockUserAdmin,
    unblockUserAdmin,
    getDashboardStats
};