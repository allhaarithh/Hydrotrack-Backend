import express from "express";
import bodyParser from 'body-parser';
import signupRoute from 'C:\Users\haari\OneDrive\Desktop\HydroTrack\Files(Backend)\src\signupRoute.js';


const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api', signupRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

