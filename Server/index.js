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
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    const allowedOrigins =["http://localhost:3000","*","https://pratham-transaction-app.vercel.app/"]
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-credentials", false);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE, PATCH");
    next();
  });
  
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