// backend/signupRoute.js
import express from 'express';
import signUpUser from './signupHandler';

const router = express.Router();

// Route for handling sign-up form submission
router.post('/signup', async (req, res) => {
  const { Email, Name, Password } = req.body;

  if (!Email || !Name || !Password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const result = await signUpUser(Email, Name, Password);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error signing up user: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
