require("dotenv").config();
const express = require("express");
const cors = require("cors");
const server = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const productRouter = require("./router/Product");
const brandRouter = require("./router/Brand");
const categoryRouter = require("./router/Category");
const userRouter = require("./router/User");
const authRouter = require("./router/Auth");
const cartRouter = require("./router/Cart");
const orderRouter = require("./router/Order");
const { User } = require("./model/User");
const crypto = require("crypto");
const { sanatizeUser, isAuth , cookieExtractor} = require("./services/Common");
const morgan = require("morgan");
const path = require("path");
const { Order } = require("./model/Order");

//Webhook
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.amount_capturable_updated':
      const paymentIntentAmountCapturableUpdated = event.data.object;
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      break;
    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object;
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case 'payment_intent.created':
      const paymentIntentCreated = event.data.object;
      // Then define and call a function to handle the event payment_intent.created
      break;
    case 'payment_intent.partially_funded':
      const paymentIntentPartiallyFunded = event.data.object;
      // Then define and call a function to handle the event payment_intent.partially_funded
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentPaymentFailed = event.data.object;
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.processing':
      const paymentIntentProcessing = event.data.object;
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case 'payment_intent.requires_action':
      const paymentIntentRequiresAction = event.data.object;
      // Then define and call a function to handle the event payment_intent.requires_action
      break;
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log(paymentIntentSucceeded);
      // Then define and call a function to handle the event payment_intent.succeeded
      const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
      order.paymentStatus = "received";
      await order.save();
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.SECRET_KEY;

//middleware
server.use(express.static(path.resolve(__dirname,'build')));

//Using Third-party Middleware -Morgan

server.use(morgan("dev"));

server.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
server.use(passport.initialize());
server.use(passport.authenticate("session"));

server.use(express.json());
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(cookieParser());

server.use("/products",isAuth(),productRouter.router);
server.use("/brands",isAuth(),brandRouter.router);
server.use("/categories",isAuth(),categoryRouter.router);
server.use("/users",isAuth(),userRouter.router);
server.use("/auth",authRouter.router);
server.use("/cart",isAuth(),cartRouter.router);
server.use("/orders",isAuth(),orderRouter.router);

// this line we add to make react router work in case of other routes doesnt match
server.get('*', (req, res) =>
  res.sendFile(path.resolve('build', 'index.html'))
);

//Passport Strategies
passport.use('local',
  new LocalStrategy({ usernameField: "email" }, 
  async function (email,password,done) {
    try {
      const user = await User.findOne({ email: email }).exec();
      if (!user) {
        return done(null, false);
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        function (err, hashedPassword) {
          if (err) {
            return done(err);
          }
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, {
              message: "Incorrect username or password.",
            });
          } else {
            const token = jwt.sign(sanatizeUser(user), process.env.SECRET_KEY);
            return done(null, {id:user.id,role:user.role,token:token});
          }
        }
      );
    } catch (err) {
      return done(err);
    }
  })
);

passport.use('jwt',
new JwtStrategy(opts, async function(jwt_payload, done) {
  try{
  const user = await User.findById(jwt_payload.id).exec();
      if (user) {
          return done(null, sanatizeUser(user));
      } else {
          return done(null, false);
          // or you could create a new account
      }
  
  }
  catch(err){
    return done(err, false);
  }

}));

//Passport Serializer && Deserializer 
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    //console.log("in serialize")
    return cb(null, sanatizeUser(user));
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
   // console.log("in Deserialize")
    return cb(null, sanatizeUser(user));
  });
});

//Payments

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount,orderId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100,
    currency: "inr",
    metadata: {
       orderId
    },
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});



//DATABASE connection
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.DB_CONNECTION);
  console.log("Database Connected");
}

server.listen(process.env.SERVER_PORT, () => {
  console.log(
    "Server Started and listening on port:" + process.env.SERVER_PORT
  );
});
