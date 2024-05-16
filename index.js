import express from "express";
import bodyParser from 'body-parser';
import db from './src/firebase.js';
import forgotPasswordHandler from './src/forgotpasswordHandler.js';
import { collection, query, where, getDocs, addDoc} from 'firebase/firestore';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

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
    let fileURL = '';

    if (file) {
      const blob = storage.ref().child(`certificates/${uuidv4()}_${file.originalname}`);
      const blobSnapshot = await blob.put(file.buffer, { contentType: file.mimetype });

      fileURL = await blobSnapshot.ref.getDownloadURL();
    }

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
    const feedRef = collection(db,"Feedback") 
    await addDoc(feedRef,{
      Name: name,
      Email: email,
      Feedback: feedback
    });
    res.json({ message: "Feedback submitted successfully.", status: true });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
