import { PassportStatic } from "passport";
import { Strategy, StrategyOptions, ExtractJwt } from "passport-jwt";
import config from "config";
import db from "../db";
import { UserToken } from "../controllers/users";

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get("jwtPrivateKey")
};

const authStrategy = new Strategy(options, async (payload: UserToken, done) => {
  try {
    const {
      rows
    } = await db.query(
      "SELECT password, user_id FROM account WHERE user_id = $1",
      [payload.id.toString()]
    );
    if (!rows[0]) return done(null, false, { message: "User not found" });
    const isValidPassword = payload.password === rows[0].password;
    if (!isValidPassword)
      return done(null, false, { message: "Invalid token" });
    return done(null, rows[0].user_id);
  } catch (error) {
    return done(error);
  }
});

export default function(passport: PassportStatic) {
  passport.use(authStrategy);
}
