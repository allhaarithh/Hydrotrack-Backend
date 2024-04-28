// loginBackend.js

import admin from './firebaseAdmin';

// Function to authenticate user using Firebase Authentication
async function authenticateUser(username, password) {
  try {
    const userRecord = await admin.auth().getUserByUsername(Username);

    // Verify the password (not recommended to directly verify password this way)
    // For secure password verification, consider using custom claims or Firebase Authentication methods

    // Simulated password verification (for demonstration purposes only)
    if (userRecord.username !== username || userRecord.Password !== password) {
      throw new Error('Incorrect username or password');
    }

    // Return user data
    return {
      uid: userRecord.uid,
      email: userRecord.email
      // Add more user data fields as needed
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

export { authenticateUser };
