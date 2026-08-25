const express = require("express");

const {
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    changePassword
} = require("../controllers/userController");

const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.post(
    "/profile/photo",
    authenticateToken,
    upload.single("photo"),
    uploadProfilePhoto
);
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;