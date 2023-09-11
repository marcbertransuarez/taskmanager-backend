const express = require("express");
const app = express();
const cors = require('cors');
require("dotenv").config();

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

mongoose
  .connect(process.env.MONGO_URL)
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch((err) => {
    console.error("Error connecting to mongo: ", err);
  });

  const authRouter = require('./routes/auth');
  const taskRouter = require ('./routes/task');


// cookies and loggers
app.use(cors({
    origin: process.env.ORIGIN
  }));
  app.set('trust proxy', 1);

// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use('/auth', authRouter)
app.use('/tasks', taskRouter);

//setup server to listen on port 8080
app.listen(process.env.PORT || 8080, () => {
  console.log("Server is live on port 8080");
});

module.exports= app;
