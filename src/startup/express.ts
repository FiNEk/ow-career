import { Application, json, static as serveStatic } from "express";
import passport from "passport";
import helmet from "helmet";
import initPassport from "./passport";
import users from "../routes/users";

export default function(app: Application) {
  app.use(json());
  app.use(helmet());
  app.use(serveStatic("./public"));
  initPassport(passport);
  app.use(passport.initialize());
  // routes
  app.use("/api/users", users);
}
