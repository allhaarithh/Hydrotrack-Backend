import express from "express";
import bodyParser from 'body-parser';
import signupRoute from './src/signupRoute';
import { authenticateUser } from './src/loginBackend';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', signupRoute);
app.use('/forgotpassword', forgotPasswordHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Admin login route handler
app.post('/api/admin/login', async (req, res) => {
  const { adminId, password } = req.body;

  try {
    const adminRef = admin.firestore().collection('Admin');
    const snapshot = await adminRef.where('adminId', '==', adminId).limit(1).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const adminData = snapshot.docs[0].data();
    if (adminData.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userData = await authenticateUser(username, password);
    res.status(200).json(userData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});