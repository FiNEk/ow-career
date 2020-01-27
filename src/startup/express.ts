import { Application, json, static as serveStatic } from "express";
import passport from "passport";
import helmet from "helmet";
import initPassport from "./passport";
import users from "../routes/users";
import career from "../routes/career";

export default function(app: Application) {
  app.use(json());
  app.use(helmet());
  app.use(serveStatic("./public"));
  initPassport(passport);
  app.use(passport.initialize());
  // routers
  app.use("/api/users", users);
  app.use("/api/career", career);
}
