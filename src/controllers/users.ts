import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import _ from "lodash";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import winston from "winston";
import config from "config";
import db from "../db";
import { validateLogin, validateUser } from "./validators";

export type UserToken = {
  id: number;
  password: string;
};
function generateAuthToken(user: UserToken) {
  const secret: string = config.get("jwtPrivateKey");
  const signedToken = jwt.sign(user, secret);
  return signedToken;
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const errors: string[] = [];
    if (!req.file) errors.push("Avatar image is required");
    const { error: validationErr, value } = validateUser(req.body);
    if (validationErr)
      validationErr.details.forEach(el => errors.push(el.message));
    if (errors[0]) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).send(errors);
    }
    const user = _.pick(value, ["firstName", "lastName", "email", "password"]);
    const newFileName = `${user.firstName}-${
      user.lastName
    }-${Date.now().toString()}${path.extname(req.file.filename)}`;
    const newFilePath = path.join(req.file.destination, newFileName);
    await fs.rename(req.file.path, newFilePath);
    req.file.path = newFilePath;
    req.file.filename = newFileName;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(value.password, salt);
    const { rows: queryResult } = await db.query(
      `INSERT INTO account (first_name, last_name, email, password, avatar_filename) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.password,
        req.file.filename
      ]
    );
    const userToken = generateAuthToken({
      id: queryResult[0].user_id,
      password: queryResult[0].password
    });
    res.setHeader("Authorization", `Bearer ${userToken}`);
    res.send({
      message: "OK",
      token: userToken
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path);
    if (error.code === "23505")
      return res.status(400).send("This e-mail already exists");
    winston.error(error.message, [error]);
    res.sendStatus(500);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = validateLogin(req.body);
    if (error) return res.status(400).send(error.message);
    const {
      rows
    } = await db.query(
      "SELECT user_id, password FROM account WHERE email = $1",
      [value.email]
    );
    if (!rows[0]) return res.status(400).send("Invalid email or password");
    const isValidPassword = await bcrypt.compare(
      value.password,
      rows[0].password
    );
    if (!isValidPassword)
      return res.status(400).send("Invalid email or password");
    const userToken = generateAuthToken({
      id: rows[0].user_id,
      password: rows[0].password
    });
    res.setHeader("Authorization", `Bearer ${userToken}`);
    res.send({
      message: "OK",
      token: userToken
    });
  } catch (error) {
    winston.error(error.message, [error]);
    res.sendStatus(500);
  }
};
