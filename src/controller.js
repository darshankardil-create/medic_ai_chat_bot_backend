import { authmodel } from "./Schema.js";
import jwt from "jsonwebtoken";

export async function signin(req, res) {
  try {
    const create = new authmodel(req.body);

    const doc = await create.save();

    const token = jwt.sign({ id: doc._id }, process.env.JWTSE, {
      expiresIn: "30d",
    });

    res.status(200).json({ message: "user signin successfully", token: token });
  } catch (error) {
    if (error?.errorResponse?.code === 11000) {
      res.status(409).json({ message: "userid already exists" });
      return;
    }

    res.status(500).json({ message: error });

    console.log(error);
  }
}

export async function login(req, res) {
  try {
    const find = await authmodel.findOne({ username: req.body.username });

    if (!find) {
      res.status(404).json({ message: "username not found" });
      return;
    }

    if (await find.comparepass(req.body.password)) {
      const token = jwt.sign({ id: find._id }, process.env.JWTSE, {
        expiresIn: "30d",
      });

      console.log(token);

      res.status(200).json({ message: "authorised user", token: token });
    } else {
      res.status(401).json({ message: "unauthorised user" });
    }
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
    console.log(error);
  }
}

export function gettokenpayload(req, res) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];

      const verify = jwt.verify(token, process.env.JWTSE);

      res.status(200).json({ message: "token valid", payload: verify });
      return;
    }

    res.status(400).json({ message: "bad request" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "token is expired" });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "token is invalid" });
    }

    console.log(error);
  }
}
