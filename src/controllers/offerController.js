const mongoose = require("mongoose");
const Offer = require("../models/Offer");

/**
 * Retrieves offers filtered by propertyID, agentEmail, or buyerEmail.
 */
async function getOffers(req, res, next) {
  try {
    const id = req.query.id;
    const agentEmail = req.query.agentEmail;
    const buyerEmail = req.query.buyerEmail;

    const query = {};
    if (id) {
      query.propertyID = id;
    }
    if (agentEmail) {
      query.agentEmail = agentEmail;
    }
    if (buyerEmail) {
      query.buyerEmail = buyerEmail;
    }

    const result = await Offer.find(query).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single offer by ID.
 */
async function getOfferById(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid offer ID." });
    }
    const result = await Offer.findById(id).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new offer on a property.
 */
async function createOffer(req, res, next) {
  try {
    const offer = req.body;
    if (offer.offeredAmount !== undefined) {
      offer.offeredAmount = Number(offer.offeredAmount) || 0;
    }
    const result = await Offer.create(offer);
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
