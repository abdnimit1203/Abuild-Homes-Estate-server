const express  = require("express")
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 3000

// middleware

app.use(cors())
app.use(express.json())


app.get('/', (req,res)=>{
    res.send("Real estate Abuild Homes data coming soon...")
})
app.listen(port, ()=>{
    console.log(`Abuild Homes Estates server running on port: ${port}`);
})
