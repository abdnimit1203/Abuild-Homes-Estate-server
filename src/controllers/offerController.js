const mongoose = require("mongoose");
const Offer = require("../models/Offer");

/**
 * Retrieves offers filtered by propertyID, agentEmail, or buyerEmail.
 * Joins live user data so buyerName is always current.
 */
async function getOffers(req, res, next) {
  try {
    const id = req.query.id;
    const agentEmail = req.query.agentEmail;
    const buyerEmail = req.query.buyerEmail;

    const matchStage = {};
    if (id) matchStage.propertyID = id;
    if (agentEmail) matchStage.agentEmail = agentEmail;
    if (buyerEmail) matchStage.buyerEmail = buyerEmail;

    const result = await Offer.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "buyerEmail",
          foreignField: "email",
          as: "_buyerDoc",
        },
      },
      {
        $addFields: {
          _liveBuyer: { $arrayElemAt: ["$_buyerDoc", 0] },
        },
      },
      {
        $addFields: {
          buyerName: {
            $ifNull: ["$_liveBuyer.name", { $ifNull: ["$buyerName", "Buyer"] }],
          },
        },
      },
      { $project: { _buyerDoc: 0, _liveBuyer: 0 } },
    ]);

    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single offer by ID. Joins live buyerName from users collection.
 */
async function getOfferById(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid offer ID." });
    }
    const results = await Offer.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "buyerEmail",
          foreignField: "email",
          as: "_buyerDoc",
        },
      },
      {
        $addFields: {
          _liveBuyer: { $arrayElemAt: ["$_buyerDoc", 0] },
        },
      },
      {
        $addFields: {
          buyerName: {
            $ifNull: ["$_liveBuyer.name", { $ifNull: ["$buyerName", "Buyer"] }],
          },
        },
      },
      { $project: { _buyerDoc: 0, _liveBuyer: 0 } },
    ]);
    res.send(results[0] || null);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new offer on a property. buyerName is stripped —
 * it will always be resolved live from the users collection on read.
 */
async function createOffer(req, res, next) {
  try {
    const { buyerName, ...offerData } = req.body;
    if (offerData.offeredAmount !== undefined) {
      offerData.offeredAmount = Number(offerData.offeredAmount) || 0;
    }
    const result = await Offer.create(offerData);
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
 * Accepts an offer and rejects other pending offers on the same property.
 */
async function acceptOffer(req, res, next) {
  try {
    const title = req.query.title;
    const id = req.query.id;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid offer ID." });
    }

    const result1 = await Offer.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status: "accepted" } }
    );

    const result2 = await Offer.updateMany(
      {
        propertyTitle: title,
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      }
    );

    res.send({ result1, result2 });
  } catch (err) {
    next(err);
  }
}

/**
 * Rejects an offer by ID.
 */
async function rejectOffer(req, res, next) {
  try {
    const id = req.query.id;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid offer ID." });
    }

    const result = await Offer.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status: "rejected" } }
    );

    res.send(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  acceptOffer,
  rejectOffer,
};
