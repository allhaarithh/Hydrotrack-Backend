// backend/signupHandler.js
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (you need to download the service account key from Firebase Console)
import serviceAccount from './path-to-your-service-account-key.json';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import db from "./firebase";


// Handler function for signing up a new user
const signUpUser = async (Username, Password, phone_no) => {
  try {
    // Add user data to Firestore
    const userRef = await collection(db,'User').addDoc({
      Username,
      Password, // Note: For security, consider encrypting the password before storing
      phone_no,
    });

    console.log('User added with ID: ', userRef.id);
    return { success: true, message: 'User signed up successfully!' };
  } catch (error) {
    console.error('Error adding user: ', error);
    return { success: false, message: 'Error signing up user' };
  }
};

export default signUpUser;
