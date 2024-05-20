import express from "express";
import bodyParser from 'body-parser';
import db from './src/firebase.js';
import { collection, query, where, getDocs, addDoc, updateDoc, doc} from 'firebase/firestore';
import cors from 'cors';
import multer from 'multer';

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


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});


//Uploading Function 
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB file size limit
  }
});


//Commercial Page Handler

app.post('/water-sales', upload.single('certificate'), async (req, res) => {
  const { name, phoneNumber, email, price, source, address, additionalInfo } = req.body;
  const file = req.file;

  try {
   

  
    // Save water source data to Firestore
    await db.collection('watersources').add({
      Name: name,
      PhoneNumber: phoneNumber,
      Email: email,
      Price: price,
      Source: source,
      Address: address,
      Certificate: fileURL || '', // Use file URL if available, otherwise empty string
      AdditionalInfo: additionalInfo
    });

    res.json({ message: "Water source submitted successfully.", status: true });
  } catch (error) {
    console.error('Error submitting water source:', error);
    res.status(500).send('Internal Server Error');
  }
});

//LoginHandler
app.post("/login/user", async (req, res) => {
  const { username, password } = req.body;
  try {
    const collectionRef = collection(db, "User"); // db should be a Firestore instance
    const q = query(collectionRef, where("Username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log(userData)
      if (userData.Password === password) {
        res.json({ message: "Logged In Successfully", status: true });
      } else {
        res.json({ message: "Incorrect Password", status: false });
      }
    } else {
      res.send({ message: "Login Unsuccessful", status: false });
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
    if (!username || !password || !phoneNumber) {
      return res.status(400).json({ status: false, message: 'Username, password and phone no. are required' });
    }

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ status: false, message: 'Phone number must be 10 digits long' });
    }

    const userRef = collection(db, 'User');
    await addDoc(userRef, {
      Username: username,
      Password: password,
      phone_no: phoneNumber,
    });

    return res.status(200).json({ status: true, message: 'Signup successful' });

  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
});




// Route to handle password reset
app.post('/forgot', async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Validate username
    if (!username) {
      return res.status(400).json({ status: false, message: 'Username is required.' });
    }

    // Query Firestore for the user by username
    const collectionRef = collection(db, 'User');
    const q = query(collectionRef, where('Username', '==', username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    // Assuming there's only one user with this username (unique username constraint)
    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // Update user's password in Firestore using updateDoc
    const userDocRef = doc(db, 'User', userId);
    await updateDoc(userDocRef, { Password: newPassword });

    res.status(200).json({ status: true, message: 'Password reset successful!' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ status: false, message: 'An error occurred. Please try again later.' });
  }
});


// Water Request Page Handler
app.post('/request', async (req, res) => {
  const { name, email, phonenumber, address, description, additional_comments, approval } = req.body;
  
  try {
    const requestRef = collection(db, 'Requests');
    await addDoc(requestRef, {
      name: name,
      email: email,
      phonenumber: phonenumber,
      Location_Address: address,
      description: description,
      additional_comments: additional_comments || '', // Set default value if additional_comments is not provided
      approval: approval
    });

    return res.status(201).json({ status: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Error submitting request:', error);
    return res.status(500).json({ status: false, message: 'An error occurred. Please try again later.' });
  }
});



// POST endpoint to handle feedback submission
app.post('/feedback', async (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const feedbackRef = collection(db, 'Feedback');
    await addDoc(feedbackRef, {
      Name: name,
      Email: email,
      Feedback: feedback,
    });

    return res.status(200).json({ status: true, message: 'Feedback submitted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Error submitting feedback.' });
  }
})


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
