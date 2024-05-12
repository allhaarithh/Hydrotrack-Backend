
import db from "./firebase.js";


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
