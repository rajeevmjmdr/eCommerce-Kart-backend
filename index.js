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


const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.SECRET_KEY;

//middleware
server.use(express.static('build'));
server.use(
  session({
    secret: "keyboard cat",
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
            return done(null, {token});
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
    console.log("in serialize")
    return cb(null, sanatizeUser(user));
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    console.log("in Deserialize")
    return cb(null, sanatizeUser(user));
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
