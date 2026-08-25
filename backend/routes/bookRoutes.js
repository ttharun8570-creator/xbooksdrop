const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
    createBook,
    getAllBooks,
    getBookById,
    getMyBooks,
    updateBook,
    deleteBook,
     uploadBookImage
} = require("../controllers/bookController");

const router = express.Router();

router.post("/", authenticateToken, createBook);

router.get("/", getAllBooks);
router.get("/my-books", authenticateToken, getMyBooks);

router.get("/:id", getBookById);

router.put("/:id", authenticateToken, updateBook);

router.delete("/:id", authenticateToken, deleteBook);
router.post(
    "/:id/images",
    authenticateToken,
    upload.single("image"),
    uploadBookImage
);
module.exports = router;