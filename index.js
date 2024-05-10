import express from "express";
import bodyParser from 'body-parser';
import signupRoute from './src/signupRoute';
import { authenticateUser } from './src/loginBackend';

const app = express();
const PORT = 3000;

// Initialize Firestore database
const db = admin.firestore();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
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

// Endpoint for handling feedback form submissions
app.post('/submit-feedback', async (req, res) => {
  const { name, email, feedback } = req.body;

  try {
    // Add feedback to Firestore
    const feedbackRef = await db.collection('feedback').add({
      name,
      email,
      feedback,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email notification
    const transporter = nodemailer.createTransport({
      // Configure your SMTP settings or use a service like Gmail
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      from: 'your-email@example.com',
      to: 'admin@example.com',
      subject: 'New Feedback Submitted',
      text: `Name: ${name}\nEmail: ${email}\nFeedback: ${feedback}`
    };

    await transporter.sendMail(mailOptions);

    // Send response to client
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
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