const express = require("express");
require("dotenv").config();
const mongoose = require('mongoose');
const database = require("./config/database");
const apiRoutes = require("./routes/api");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const corsOptions = {
    origin: ['http://localhost:3000', 'https://roxiler-assignment-two.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Adjust methods as per your requirements
    allowedHeaders: ['Content-Type', 'Authorization'], // Add any headers you expect
    credentials: true, // Enable this if you need to include cookies or authorization headers
};
  
app.use(bodyParser.json());

app.use("/api/products", apiRoutes);

// CORS Configuration

// const Product = require('./models/Product');

database.connect();

// default route
app.get("/", (req,res) => {
    return res.json({
        success:true,
        message:'Your server is up and running....'
    })    
});    

app.listen(PORT, ()=> {
    console.log(`App is running at ${PORT}`)
});    