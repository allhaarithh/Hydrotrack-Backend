import express from "express";
import bodyParser from 'body-parser';
import db from './src/firebase.js';
import forgotPasswordHandler from './src/forgotpasswordHandler.js';
import { collection, query, where, getDocs, addDoc} from 'firebase/firestore';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Enable CORS for all routes
app.use(cors());
const corsOptions = {
  origin: 'http://localhost:3000', // Specify the allowed origin
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json()); // Middleware to parse JSON request bodies

// Routes
app.use('/forgot', forgotPasswordHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

//LoginHandler
app.post("/login/user", async (req, res) => {
  const { username, password } = req.body;
  try {
    const collectionRef = collection(db, "User");
    const q = query(collectionRef, where("Username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log(userData)
      if (userData.Password === password) {
        res.json({message:"Logged In Successfully", status : true});
      } else {
        res.json({message:"Incorrect Password",status:false});
      }
    } else {
      res.send({message:"Login Unsuccessful",status:false});
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Internal Server Error");
  }
});


// Admin login route handler
app.post('/login/admin', async (req, res) => {
  const { adminId, password } = req.body;

  try {
    const collectionRef = collection(db, "Admin");
    const q = query(collectionRef, where("adminID", "==", adminId ));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const adminData = querySnapshot.docs[0].data();
      console.log(adminData)
      if (adminData.password === password) {
        res.json({message:"Logged In Successfully",status:true});
      } else {
        res.json({message:"Incorrect Password",status:false});
      }
    } else {
      res.json({message:"Login failed",status:false});
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Signup Handler
app.post('/signup', async (req, res) => {
  const { username, password, phoneNumber } = req.body;

  try {
    const collectionRef = collection(db, 'User');
    await addDoc(collectionRef, {
      Username: username,
      Password: password,
      phone_no: phoneNumber,
    });
    res.send('Signup successful');

  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint for handling feedback form submissions
app.post('/feedback', async (req, res) => {
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
