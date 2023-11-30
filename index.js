const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 3000;
const reviews = require("./reviews.json");

// middleware

app.use(cors());
app.use(express.json());

//mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.di78vms.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // all collections
    const usersCollection = client.db("abuildhomesDB").collection("users");
    const propertiesCollection = client
      .db("abuildhomesDB")
      .collection("properties");
    const reviewsCollection = client.db("abuildhomesDB").collection("reviews");
    const wishlistsCollection = client
      .db("abuildhomesDB")
      .collection("wishlists");
    const offersCollection = client.db("abuildhomesDB").collection("offers");
    const paymentsCollection = client
      .db("abuildhomesDB")
      .collection("payments");

    // jwt api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // user related apis

    app.post("/api/v1/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    app.get("/api/v1/users", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    // single user Data role get
    app.get("/api/v1/users/role", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { email: email };
      }
      const result = await usersCollection.findOne(query);
      res.send(result?.role);
    });

    // Property related apis

    //all properties + query properties
    app.get("/api/v1/properties", async (req, res) => {
      const status = req.query.status;
      const email = req.query.email;
      let query = {};
      if (status) {
        query = { status: status };
      }
      if (email) {
        query = { agentEmail: email };
      }

      const propertiesData = await propertiesCollection.find(query).toArray();
      const countData = await propertiesCollection.countDocuments(query);
      res.send({ propertiesData, countData });
    });
    //id wise property data get
    app.get("/api/v1/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.findOne(query);
      res.send(result);
    });

    app.post("/api/v1/properties", async (req, res) => {
      const property = req.body;

      const result = await propertiesCollection.insertOne(property);
      res.send(result);
    });
    app.delete("/api/v1/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertiesCollection.deleteOne(query);
      res.send(result);
    });

    // wishlist realated data
    app.post("/api/v1/wishlists", async (req, res) => {
      const wishlist = req.body;
      const result = await wishlistsCollection.insertOne(wishlist);
      res.send(result);
    });

    app.get("/api/v1/wishlists", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { userEmail: email };
      }
      const result = await wishlistsCollection.find(query).toArray();
      res.send(result);
    });
    //id wise property data get
    app.get("/api/v1/wishlists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/api/v1/wishlists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistsCollection.deleteOne(query);
      res.send(result);
    });

    //review related api

    app.get("/api/v1/reviews", async (req, res) => {
      const id = req.query.id;
      const email = req.query.email;
      let query = {};
      if (id) {
        query = { propertyID: id };
      }
      if (email) {
        query = { userEmail: email };
      }

      const result = await reviewsCollection
        .find(query)
        .sort({ reviewTime: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/api/v1/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });
    app.delete("/api/v1/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    // OFFER realated data
    app.post("/api/v1/offers", async (req, res) => {
      const offer = req.body;
      const result = await offersCollection.insertOne(offer);
      res.send(result);
    });
    app.get("/api/v1/offers", async (req, res) => {
      const offer = req.body;
      const id = req.query.id;
      const agentEmail = req.query.agentEmail;
      const buyerEmail = req.query.buyerEmail;
      let query = {};
      if (id) {
        query = { propertyID: id };
      }
      if (agentEmail) {
        query = { agentEmail: agentEmail };
      }
      if (buyerEmail) {
        query = { buyerEmail: buyerEmail };
      }

      const result = await offersCollection.find(query).toArray();
      res.send(result);
    });

    //id wise offered get
    app.get("/api/v1/offers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await offersCollection.findOne(query);
      res.send(result);
    });
    // offer accept vs reject handling
    app.get("/api/v1/accepted-offer", async (req, res) => {
      const title = req.query.title;
      const id = req.query.id;

      const filter1= {_id : new ObjectId(id)}
      const filter2 = {
        $and: [{ propertyTitle: title }, { status: "pending" }],
      };
      const updateDoc1 = {
        $set: { status: "accepted" },
      };
      const updateDoc2 = {
        $set: { status: "rejected" },
      };
      const result1 = await offersCollection.updateOne(filter1,updateDoc1);
      const result2 = await offersCollection.updateMany(filter2,updateDoc2);
      res.send({result1,result2});
    });
    app.get("/api/v1/rejected-offer", async (req, res) => {
      
      const id = req.query.id;

      const filter= {_id : new ObjectId(id)}
      
      const updateDoc = {
        $set: { status: "rejected" },
      };
     
      const result = await offersCollection.updateOne(filter,updateDoc);
      res.send(result)
      
    });

    //payments realated
    app.get("/api/v1/payments", async (req, res) => {
      const agentEmail = req.query.agentEmail;
      let query = {};

      if (agentEmail) {
        query = { agentEmail: agentEmail };
      }

      const result = await paymentsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/api/v1/payments", async (req, res) => {
      const payments = req.body;
      const result = await paymentsCollection.insertOne(payments);
      const options = { upsert: true };
      const filter = { _id: new ObjectId(payments.offersId) };
      const updateDoc = {
        $set: {
          status: "bought",
          transacionId: payments.transactionId,
        },
      };
      const updateStatus = await offersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send({ result, updateStatus });
    });

    // Stripe payment intent method
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Real estate Abuild Homes server data is here...");
});
app.get("/reviews", (req, res) => {
  res.send(reviews);
});
app.listen(port, () => {
  console.log(`Abuild Homes Estates server running on port: ${port}`);
});
