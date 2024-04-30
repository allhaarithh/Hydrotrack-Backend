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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
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