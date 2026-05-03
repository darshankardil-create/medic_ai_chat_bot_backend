import express from "express";
import { signin, login, gettokenpayload } from "./controller.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/login", login);
router.get("/gettokenpayload", gettokenpayload);

export default router;
