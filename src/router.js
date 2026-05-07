import express from "express";
import {
  signin,
  login,
  gettokenpayload,
  savechats,
  deleteacandchats,
  getmyaccinfo,
  getmyallchats,
  updatechathistory,
  deletechat,
} from "./controller.js";

const router = express.Router();

//auth req handlers

router.post("/signin", signin);
router.post("/login", login);
router.get("/gettokenpayload", gettokenpayload);
router.delete("/deleteacandchats/:id/:username", deleteacandchats);
router.get("/getmyaccinfo/:id", getmyaccinfo);

//chat history req handlers

router.post("/savechats", savechats);
router.get("/getmyallchats/:username", getmyallchats);
router.put("/updatechathistory/:id", updatechathistory);
router.delete("/deletechat/:id", deletechat);

export default router;
