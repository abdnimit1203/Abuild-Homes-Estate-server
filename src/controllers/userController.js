const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const { deleteFirebaseUser } = require("../config/firebase");

/**
 * Creates a new user if not already existing.
 */
async function createUser(req, res, next) {
  try {
    const user = req.body;
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return res.send({ message: "user already exist", insertedId: null });
    }
    const result = await User.create(user);
    res.send({
      acknowledged: true,
      insertedId: result._id,
      ...result.toObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves all users or filters by email query parameter.
 */
async function getUsers(req, res, next) {
  try {
    const email = req.query.email;
    const query = email ? { email } : {};
    const result = await User.find(query).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves role for a given user email.
 */
async function getUserRole(req, res, next) {
  try {
    const email = req.query.email;
    const query = email ? { email } : {};
    const user = await User.findOne(query).select("role").lean();
    res.send(user?.role || "");
  } catch (err) {
    next(err);
  }
}

/**
 * Updates a user's role by ID.
 */
async function updateUserRole(req, res, next) {
  try {
    const id = req.query.id;
    const role = req.query.role;

    if (!id) {
      return res.status(400).send({ message: "User ID is required." });
    }

    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { role } }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Updates user name by email.
 */
async function updateUsername(req, res, next) {
  try {
    const email = req.query.email;
    const username = req.query.username;

    if (!email) {
      return res.status(400).send({ message: "User email is required." });
    }

    const result = await User.updateOne(
      { email },
      { $set: { name: username } }
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes user both from Firebase Authentication and MongoDB.
 */
async function deleteUser(req, res, next) {
  try {
    const id = req.query.id;
    const queryEmail = req.query.email;
    const queryUid = req.query.uid;

    let targetEmail = queryEmail;
    let targetUid = queryUid;

    // 1. Fetch user from MongoDB first if ID is provided to extract email and uid
    if (id && mongoose.isValidObjectId(id)) {
      const existingUser = await User.findById(id).lean();
      if (existingUser) {
        if (!targetEmail) targetEmail = existingUser.email;
        if (!targetUid) targetUid = existingUser.uid;
      }
    }

    // 2. Delete user from Firebase Authentication
    let firebaseResult = { deleted: false, message: "No email or UID found for Firebase deletion." };
    if (targetUid || targetEmail) {
      firebaseResult = await deleteFirebaseUser({ uid: targetUid, email: targetEmail });
    }

    // 3. Delete from MongoDB users collection
    let mongoResult = null;
    if (id && mongoose.isValidObjectId(id)) {
      mongoResult = await User.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    } else if (targetEmail) {
      mongoResult = await User.deleteOne({ email: targetEmail });
    }

    res.send({
      success: true,
      deletedCount: mongoResult?.deletedCount || 0,
      mongoResult,
      firebaseDeleted: firebaseResult.deleted,
      firebaseMessage: firebaseResult.message,
      error: firebaseResult.error,
    });
  } catch (error) {
    console.error("Error in delete /api/v1/users:", error);
    next(error);
  }
}

/**
 * Marks user and all associated properties as fraud.
 */
async function markUserAsFraud(req, res, next) {
  try {
    const id = req.query.id;
    const email = req.query.email;

    if (!id || !email) {
      return res.status(400).send({ message: "User ID and agent email are required." });
    }

    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { role: "fraud" } }
    );
    const result2 = await Property.updateMany(
      { agentEmail: email },
      { $set: { status: "fraud" } }
    );

    res.send({ result, result2 });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserRole,
  updateUserRole,
  updateUsername,
  deleteUser,
  markUserAsFraud,
};
