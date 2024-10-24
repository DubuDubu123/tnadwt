const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./src/routes");
const axios = require('axios');
const xml2js = require('xml2js');
const { Buffer } = require('buffer');
const fileUpload = require('express-fileupload');
const xlsx = require('xlsx');
const cors = require("cors");
const path = require('path'); 
//const userRoutes = require('./src/routes/userRoutes'); // Make sure this is the correct path to userRoutes
const app = express();
app.use(express.json());
// CORS Configuration
var whitelist = ['http://localhost:4200', 'http://localhost:3001', "http://a4f506a.online-server.cloud", "http://127.0.0.1:8000", "https://inspection1.proz.in", 'https://shg.mathikalam.org', 'https://mathikalam.org']
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
} 

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(fileUpload());
app.use("/", routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Adding userRoutes to handle requests
//app.use('/apps/users', userRoutes); // Add this line

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
