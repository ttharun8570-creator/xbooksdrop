const pool = require("../config/database");
const bcrypt = require("bcrypt");

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const result = await pool.query(
            `SELECT
                user_id,
                name,
                email,
                college_name,
                college_id,
                phone,
                profile_photo_url,
                role,
                is_verified,
                created_at
             FROM users
             WHERE user_id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Get profile error:", error.message);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};


// Update logged-in user's profile
const updateProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const {
            name,
            college_name,
            college_id,
            phone
        } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET name = $1,
                 college_name = $2,
                 college_id = $3,
                 phone = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING
                user_id,
                name,
                email,
                college_name,
                college_id,
                phone,
                profile_photo_url,
                role,
                is_verified,
                updated_at`,
            [
                name,
                college_name,
                college_id,
                phone,
                user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Update profile error:", error.message);

        res.status(500).json({
            message: "Failed to update profile"
        });
    }
};

// Upload or update profile photo
const uploadProfilePhoto = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload an image"
            });
        }

        const profilePhotoUrl = `/uploads/${req.file.filename}`;

        const result = await pool.query(
            `UPDATE users
             SET profile_photo_url = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2
             RETURNING
                user_id,
                name,
                email,
                college_name,
                college_id,
                phone,
                profile_photo_url,
                role,
                is_verified,
                updated_at`,
            [profilePhotoUrl, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Upload profile photo error:", error.message);

        res.status(500).json({
            message: "Failed to upload profile photo"
        });
    }
};

// Change password for logged-in user
const changePassword = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const currentPassword = req.body.currentPassword || req.body.current_password;
        const newPassword = req.body.newPassword || req.body.new_password;

        // Validate presence
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Both current password and new password are required"
            });
        }

        // Validate new password format/length
        if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
        }

        // Check if new password matches current password
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password cannot be the same as the current password"
            });
        }

        // Fetch current password hash from database
        const userResult = await pool.query(
            "SELECT password FROM users WHERE user_id = $1",
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = userResult.rows[0];

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        await pool.query(
            `UPDATE users
             SET password = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2`,
            [hashedNewPassword, user_id]
        );

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error.message);

        res.status(500).json({
            message: "Failed to change password"
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfilePhoto,
    changePassword
};