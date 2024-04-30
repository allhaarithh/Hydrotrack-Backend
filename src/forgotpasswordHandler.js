// forgotPasswordHandler.js
import express from 'express';
import db from './firebase'; // Import Firestore instance

const router = express.Router();

// Route for handling password reset request
router.post('/forgotpassword', async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  try {
    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Retrieve user by username from Firestore
    const userQuery = await db.collection('User').where('username', '==', username).get();

    // Check if user exists
    if (userQuery.empty) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Since username should be unique, there should be only one document
    const userDoc = userQuery.docs[0];

    // Update user's password in Firestore
    await userDoc.ref.update({ password: newPassword });

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;

