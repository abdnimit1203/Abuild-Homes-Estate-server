const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
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
    const propertiesCollection = client.db("abuildhomesDB").collection("properties");
    const reviewsCollection = client.db("abuildhomesDB").collection("reviews");

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
      const countData = await propertiesCollection.countDocuments(query)
      res.send({propertiesData,countData});
    });
    //id wise property data get
    app.get("/api/v1/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query= {_id: new ObjectId(id)}
      const result = await propertiesCollection.findOne(query);
      res.send(result);
    });

    app.post("/api/v1/properties", async (req, res) => {
      const status = req.body;
      const query = { status: property.status };

      const result = await propertiesCollection.insertOne(property);
      res.send(result);
    });


    //review related api

    app.get("/api/v1/reviews", async (req, res) => {
      const id = req.query.id;
      const email = req.query.email;
      let query = {}
      if(id){
        query= {propertyID: id}
      }
      if(email){
        query= {userEmail: email}
      }

      const result = await reviewsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/api/v1/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
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
