import express from "express";
import { signin, login, gettokenpayload,savechats,deleteacandchats,getmyaccinfo,getmyallchats} from "./controller.js"; //deleteac

const router = express.Router();

router.post("/signin", signin);
router.post("/login", login);
router.get("/gettokenpayload", gettokenpayload);
router.post("/savechats",savechats)
router.delete("/deleteacandchats/:id/:username",deleteacandchats);
router.get("/getmyaccinfo/:id",getmyaccinfo)
router.get("/getmyallchats/:username",getmyallchats)



export default router;
