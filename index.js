require("dotenv").config();
const express = require("express");
const cors = require("cors");
const server = express();
const mongoose = require("mongoose");
const productRouter = require('./router/Product');
const brandRouter = require('./router/Brand');
const categoryRouter = require('./router/Category');
const userRouter = require('./router/User');
const authRouter = require('./router/Auth');
const cartRouter = require('./router/Cart');
const orderRouter = require('./router/Order');

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.DB_CONNECTION);
  console.log("Database Connected");
}

//middleware
server.use(express.json());
server.use(cors(
  { 
    exposedHeaders:['X-Total-Count']
  }
));

server.use('/products',productRouter.router);
server.use('/brands',brandRouter.router);
server.use('/categories',categoryRouter.router);
server.use('/users',userRouter.router);
server.use('/auth',authRouter.router);
server.use('/cart',cartRouter.router);
server.use('/orders',orderRouter.router);



server.listen(process.env.SERVER_PORT, () => {
    console.log(
      "Server Started and listening on port:" + process.env.SERVER_PORT
    );
  });
