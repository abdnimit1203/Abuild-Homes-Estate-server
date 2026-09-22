const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Offer = require("../models/Offer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Retrieves payment history, optionally filtered by agent email.
 * Joins live user data so buyerName is always current.
 */
async function getPayments(req, res, next) {
  try {
    const agentEmail = req.query.agentEmail;
    const matchStage = agentEmail ? { agentEmail } : {};

    const result = await Payment.aggregate([
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
 * Records a successful payment and marks the associated offer as bought.
 * buyerName is stripped — resolved live from users collection on read.
 */
async function createPayment(req, res, next) {
  try {
    const { buyerName, ...payments } = req.body;
    if (payments.soldPrice !== undefined) {
      payments.soldPrice = Number(payments.soldPrice) || 0;
    }

    const result = await Payment.create(payments);

    let updateStatus = null;
    if (payments.offersId && mongoose.isValidObjectId(payments.offersId)) {
      updateStatus = await Offer.updateOne(
        { _id: new mongoose.Types.ObjectId(payments.offersId) },
        {
          $set: {
            status: "bought",
            transacionId: payments.transactionId,
            transactionId: payments.transactionId,
          },
        },
        { upsert: true }
      );
    }

    res.send({
      result: {
        acknowledged: true,
        insertedId: result._id,
        ...result.toObject(),
      },
      updateStatus,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Generates a Stripe payment intent client secret.
 */
async function createPaymentIntent(req, res, next) {
  try {
    const { price } = req.body;
    const amount = Math.round(Number(price) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPayments,
  createPayment,
  createPaymentIntent,
};
