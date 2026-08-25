const pool = require("../config/database");

const ALLOWED_CONDITIONS = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const ALLOWED_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SOLD"];

// Create a new book listing (status: PENDING)
const createBook = async (req, res) => {
    try {
        const {
            category_id,
            title,
            author,
            description,
            condition,
            price,
            edition,
            publication_year
        } = req.body;

        const seller_id = req.user.user_id;

        if (!category_id || !title || !condition || price === undefined) {
            return res.status(400).json({
                message: "Required fields are missing: category_id, title, condition, price"
            });
        }

        // Validate price
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({
                message: "Invalid price: price must be a non-negative number"
            });
        }

        // Normalize and validate condition
        const normalizedCondition = condition.trim().toUpperCase();
        if (!ALLOWED_CONDITIONS.includes(normalizedCondition)) {
            return res.status(400).json({
                message: `Invalid condition: must be one of ${ALLOWED_CONDITIONS.join(", ")}`
            });
        }

        // Verify category exists
        const catCheck = await pool.query(
            "SELECT category_id FROM categories WHERE category_id = $1",
            [category_id]
        );
        if (catCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid category_id: category does not exist"
            });
        }

        const result = await pool.query(
            `INSERT INTO books
            (seller_id, category_id, title, author, description, condition,
             price, edition, publication_year, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
             RETURNING *`,
            [
                seller_id,
                category_id,
                title.trim(),
                author ? author.trim() : null,
                description ? description.trim() : null,
                normalizedCondition,
                numPrice,
                edition ? edition.trim() : null,
                publication_year ? parseInt(publication_year) : null
            ]
        );

        res.status(201).json({
            message: "Book listing created successfully",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Create book error:", error.message);

        res.status(500).json({
            message: "Failed to create book listing"
        });
    }
};

// Get all approved books with search, filters, pagination, and sorting
const getAllBooks = async (req, res) => {
    try {
        const {
            search,
            category_id,
            condition,
            min_price,
            max_price,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);
        const offset = (pageNumber - 1) * limitNumber;

        let whereClause = `WHERE books.status = 'APPROVED'`;
        const filterValues = [];
        let index = 1;

        if (search) {
            whereClause += `
                AND (
                    LOWER(books.title) LIKE LOWER($${index})
                    OR LOWER(books.author) LIKE LOWER($${index})
                    OR LOWER(books.description) LIKE LOWER($${index})
                )
            `;
            filterValues.push(`%${search.trim()}%`);
            index++;
        }

        if (category_id) {
            whereClause += ` AND books.category_id = $${index}`;
            filterValues.push(category_id);
            index++;
        }

        if (condition) {
            whereClause += ` AND UPPER(books.condition) = UPPER($${index})`;
            filterValues.push(condition.trim());
            index++;
        }

        if (min_price) {
            whereClause += ` AND books.price >= $${index}`;
            filterValues.push(min_price);
            index++;
        }

        if (max_price) {
            whereClause += ` AND books.price <= $${index}`;
            filterValues.push(max_price);
            index++;
        }

        // Sorting
        let orderClause = `ORDER BY books.created_at DESC`;
        if (sort === "price_asc") {
            orderClause = `ORDER BY books.price ASC, books.created_at DESC`;
        } else if (sort === "price_desc") {
            orderClause = `ORDER BY books.price DESC, books.created_at DESC`;
        } else if (sort === "oldest") {
            orderClause = `ORDER BY books.created_at ASC`;
        }

        // Get total count of matching books
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM books
            ${whereClause}
        `;

        const countResult = await pool.query(countQuery, filterValues);
        const totalBooks = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalBooks / limitNumber);

        // Fetch books with primary image and category name
        const booksQuery = `
            SELECT
                books.*,
                categories.name AS category_name,
                (
                    SELECT image_url
                    FROM book_images
                    WHERE book_images.book_id = books.book_id
                    ORDER BY is_primary DESC, created_at ASC
                    LIMIT 1
                ) AS image_url
            FROM books
            LEFT JOIN categories ON books.category_id = categories.category_id
            ${whereClause}
            ${orderClause}
            LIMIT $${index}
            OFFSET $${index + 1}
        `;

        const booksValues = [
            ...filterValues,
            limitNumber,
            offset
        ];

        const result = await pool.query(booksQuery, booksValues);

        res.status(200).json({
            books: result.rows,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalBooks,
                totalPages
            }
        });

    } catch (error) {
        console.error("Get books error:", error.message);

        res.status(500).json({
            message: "Failed to fetch books"
        });
    }
};

// Get single book by ID with seller details and all uploaded images
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get book + seller contact & profile info
        const bookResult = await pool.query(
            `SELECT
                books.*,
                categories.name AS category_name,
                users.name AS seller_name,
                users.email AS seller_email,
                users.phone AS seller_phone,
                users.college_name AS seller_college,
                users.is_verified AS seller_verified,
                users.profile_photo_url AS seller_profile_photo
             FROM books
             LEFT JOIN categories ON books.category_id = categories.category_id
             JOIN users ON books.seller_id = users.user_id
             WHERE books.book_id = $1`,
            [id]
        );

        if (bookResult.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const book = bookResult.rows[0];

        // Fetch all images for this book
        const imageResult = await pool.query(
            `SELECT *
             FROM book_images
             WHERE book_id = $1
             ORDER BY is_primary DESC, created_at ASC`,
            [id]
        );

        res.status(200).json({
            book: {
                book_id: book.book_id,
                seller_id: book.seller_id,
                category_id: book.category_id,
                category_name: book.category_name,
                title: book.title,
                author: book.author,
                description: book.description,
                condition: book.condition,
                price: book.price,
                edition: book.edition,
                publication_year: book.publication_year,
                status: book.status,
                admin_note: book.admin_note,
                created_at: book.created_at,
                updated_at: book.updated_at,

                seller: {
                    user_id: book.seller_id,
                    name: book.seller_name,
                    email: book.seller_email,
                    phone: book.seller_phone,
                    college_name: book.seller_college,
                    is_verified: book.seller_verified,
                    profile_photo_url: book.seller_profile_photo
                },

                images: imageResult.rows
            }
        });

    } catch (error) {
        console.error("Get book error:", error.message);

        res.status(500).json({
            message: "Failed to fetch book"
        });
    }
};

// Update own book listing
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            category_id,
            title,
            author,
            description,
            condition,
            price,
            edition,
            publication_year
        } = req.body;

        const seller_id = req.user.user_id;

        let normalizedCondition = null;
        if (condition) {
            normalizedCondition = condition.trim().toUpperCase();
            if (!ALLOWED_CONDITIONS.includes(normalizedCondition)) {
                return res.status(400).json({
                    message: `Invalid condition: must be one of ${ALLOWED_CONDITIONS.join(", ")}`
                });
            }
        }

        let numPrice = null;
        if (price !== undefined) {
            numPrice = Number(price);
            if (isNaN(numPrice) || numPrice < 0) {
                return res.status(400).json({
                    message: "Invalid price: price must be a non-negative number"
                });
            }
        }

        const result = await pool.query(
            `UPDATE books
             SET category_id = COALESCE($1, category_id),
                 title = COALESCE($2, title),
                 author = COALESCE($3, author),
                 description = COALESCE($4, description),
                 condition = COALESCE($5, condition),
                 price = COALESCE($6, price),
                 edition = COALESCE($7, edition),
                 publication_year = COALESCE($8, publication_year),
                 status = 'PENDING',
                 admin_note = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE book_id = $9
               AND seller_id = $10
             RETURNING *`,
            [
                category_id || null,
                title ? title.trim() : null,
                author ? author.trim() : null,
                description ? description.trim() : null,
                normalizedCondition,
                numPrice !== null ? numPrice : null,
                edition ? edition.trim() : null,
                publication_year ? parseInt(publication_year) : null,
                id,
                seller_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "You are not allowed to update this book or it does not exist"
            });
        }

        res.status(200).json({
            message: "Book updated and submitted for admin review",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Update book error:", error.message);

        res.status(500).json({
            message: "Failed to update book"
        });
    }
};

// Delete own book listing
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.user_id;

        // Delete associated book images first
        await pool.query(
            "DELETE FROM book_images WHERE book_id = $1 AND book_id IN (SELECT book_id FROM books WHERE book_id = $1 AND seller_id = $2)",
            [id, seller_id]
        );

        const result = await pool.query(
            `DELETE FROM books
             WHERE book_id = $1
               AND seller_id = $2
             RETURNING *`,
            [id, seller_id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "You are not allowed to delete this book or it does not exist"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Delete book error:", error.message);

        res.status(500).json({
            message: "Failed to delete book"
        });
    }
};

// Get all books owned by the logged-in student
const getMyBooks = async (req, res) => {
    try {
        const seller_id = req.user.user_id;

        const result = await pool.query(
            `SELECT
                books.*,
                categories.name AS category_name,
                (
                    SELECT image_url
                    FROM book_images
                    WHERE book_images.book_id = books.book_id
                    ORDER BY is_primary DESC, created_at ASC
                    LIMIT 1
                ) AS image_url
             FROM books
             LEFT JOIN categories ON books.category_id = categories.category_id
             WHERE books.seller_id = $1
             ORDER BY books.created_at DESC`,
            [seller_id]
        );

        res.status(200).json({
            books: result.rows
        });

    } catch (error) {
        console.error("Get my books error:", error.message);

        res.status(500).json({
            message: "Failed to fetch your books"
        });
    }
};

// Upload image for a book (Multer: field "image")
const uploadBookImage = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.user_id;

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image"
            });
        }

        // Check if book belongs to logged-in seller
        const bookResult = await pool.query(
            `SELECT * FROM books
             WHERE book_id = $1 AND seller_id = $2`,
            [id, seller_id]
        );

        if (bookResult.rows.length === 0) {
            return res.status(403).json({
                message: "You are not allowed to upload an image for this book"
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        // Check whether the book already has an image
        const existingImage = await pool.query(
            `SELECT image_id
             FROM book_images
             WHERE book_id = $1
             LIMIT 1`,
            [id]
        );

        // First image becomes primary
        const isPrimary = existingImage.rows.length === 0;

        const result = await pool.query(
            `INSERT INTO book_images
             (book_id, image_url, is_primary)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, imageUrl, isPrimary]
        );

        res.status(201).json({
            message: "Book image uploaded successfully",
            image: result.rows[0]
        });

    } catch (error) {
        console.error("Upload image error:", error.message);

        res.status(500).json({
            message: "Failed to upload book image"
        });
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    getMyBooks,
    updateBook,
    deleteBook,
    uploadBookImage
};