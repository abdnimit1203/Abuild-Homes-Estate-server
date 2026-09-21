const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

/**
 * Initializes Firebase Admin SDK using available environment variables.
 * Supports:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (JSON string or path to .json file)
 * 2. FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID
 */
function getFirebaseAdminAuth() {
  const apps = getApps();
  if (apps.length > 0) {
    return getAuth(apps[0]);
  }

  try {
    // Option 1: Full service account JSON or file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let credentials;
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      if (raw.startsWith("{")) {
        credentials = JSON.parse(raw);
      } else {
        credentials = require(raw);
      }
      const app = initializeApp({
        credential: cert(credentials),
      });
      console.log("✅ Firebase Admin successfully initialized via FIREBASE_SERVICE_ACCOUNT_KEY");
      return getAuth(app);
    }

    // Option 2: Client email and private key directly in environment
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      const projectId = process.env.FIREBASE_PROJECT_ID || "abuild-homesabd";

      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log("✅ Firebase Admin successfully initialized via client email & private key");
      return getAuth(app);
    }

    console.warn("⚠️ Firebase Admin credentials not found in server environment.");
  } catch (err) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", err.message);
  }

  return null;
}

/**
 * Deletes a user from Firebase Authentication by UID or Email.
 * @param {{ uid?: string, email?: string }} param0
 * @returns {Promise<{ deleted: boolean, message: string, uid?: string, error?: string }>}
 */
async function deleteFirebaseUser({ uid, email }) {
  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return {
      deleted: false,
      message: "Firebase Admin credentials not configured on the server.",
    };
  }

  try {
    let resolvedUid = uid;

    // If UID is missing, search Firebase Authentication by email
    if (!resolvedUid && email) {
      try {
        const userRecord = await auth.getUserByEmail(email);
        resolvedUid = userRecord.uid;
      } catch (lookupErr) {
        if (lookupErr.code === "auth/user-not-found") {
          return {
            deleted: true,
            message: "User was already absent from Firebase Authentication.",
          };
        }
        throw lookupErr;
      }
    }

    if (!resolvedUid) {
      return {
        deleted: false,
        message: "Neither UID nor Email was provided to identify the Firebase user.",
      };
    }

    // Delete user from Firebase Auth
    await auth.deleteUser(resolvedUid);
    console.log(`✅ Successfully deleted Firebase Auth user with UID: ${resolvedUid}`);

    return {
      deleted: true,
      uid: resolvedUid,
      message: "User permanently deleted from Firebase Authentication.",
    };
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      return {
        deleted: true,
        message: "User was already deleted or not found in Firebase Authentication.",
      };
    }
    console.error("❌ Error deleting user from Firebase Authentication:", err);
    return {
      deleted: false,
      error: err.message,
      code: err.code,
    };
  }
}

module.exports = {
  getFirebaseAdminAuth,
  deleteFirebaseUser,
};
