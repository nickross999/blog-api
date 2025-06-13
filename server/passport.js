const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: username },
      });
      if (!user) {
        return done(null, false, { message: "User not found" });
      } else {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      }
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new JWTStrategy(opts, async (jwt_payload, done) => {
    try {
      return done(null, {
        id: jwt_payload.user.id,
        email: jwt_payload.user.email,
        name: jwt_payload.user.name,
        iat: jwt_payload.iat,
        exp: jwt_payload.exp
      });
    } catch (err) {
      return done(err, false);
    }
  })
);

function optionalAuth(req, res, next) {
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (user) {
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name
            };
        }
        next();
    })(req, res, next);
}

module.exports = {
  passport,
  prisma,
  bcrypt,
  jwt,
  optionalAuth
};
