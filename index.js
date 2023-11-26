const express  = require("express")
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 3000
const reviews = require('./reviews.json')

// middleware

app.use(cors())
app.use(express.json())



//mongoDB 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.di78vms.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();




    const usersCollection = client.db("abuildhomesDB").collection("users");

    // jwt api
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET ,{
            expiresIn: '1h',
        })
        res.send({token})
    })

// user related apis

    app.post('/api/v1/users',async(req,res)=>{
       const user = req.body
       const query ={email: user.email} 
       const existingUser = await usersCollection.findOne(query)
       if(existingUser){
        return res.send({message: "user already exist", insertedId: null})
       }
       const result = await usersCollection.insertOne(user)
       res.send(result)
    })
    app.get('/api/v1/users',async(req,res)=>{
       const email = req.query.email
       let query ={} 
      if(email){
        query = {email: email} 
      }
      const result = await usersCollection.find(query).toArray()
      res.send(result)
      //  const existingUser = await usersCollection.findOne(query)
      //  if(existingUser){
      //   return res.send({message: "user already exist", insertedId: null})
      //  }
      //  const result = await usersCollection.insertOne(user)
      //  res.send(result)
    })
    







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req,res)=>{
    res.send("Real estate Abuild Homes server data is here...")
})
app.get('/reviews', (req,res)=>{
    res.send(reviews)
})
app.listen(port, ()=>{
    console.log(`Abuild Homes Estates server running on port: ${port}`);
})
