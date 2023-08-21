require("dotenv").config();
const express = require("express");
const server = express();

const mongoose = require("mongoose");

//middleware
server.use(express.json());

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.DB_CONNECTION);
  console.log("Database Connected");
}

// Router applying
const productRouter = require('./router/Product');
const brandRouter = require('./router/Brand');
const categoryRouter = require('./router/Category');

server.use('/products',productRouter.router);
server.use('/brands',brandRouter.router);
server.use('/categories',categoryRouter.router);

server.listen(process.env.SERVER_PORT, () => {
    console.log(
      "Server Started and listening on port:" + process.env.SERVER_PORT
    );
  });
