import { authmodel, chatmodel } from "./Schema.js";
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

export async function deletechat(req, res) {
  try {
    const deleteparticularchat = await chatmodel.findByIdAndDelete(
      req.params.id,
    );

    if (!deleteparticularchat) {
      return res
        .status(404)
        .json({ message: `chat id:${req.params.id} doesnt exist in db` });
    }

    res.status(200).json({
      message: `successfully deleted chat id:${req.params.id} from chat history`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });

    console.log(error);
  }
}

export async function updatechathistory(req, res) {
  try {
    const updatechathistory = await chatmodel.findByIdAndUpdate(
      req.params.id,
      req.body.updateddata,
      {
        returnDocument: "after",
      },
    );

    if (!updatechathistory) {
      return res.status(404).json({
        message: `id : ${req.params.id} not found to update chat history`,
      });
    }

    res.status(200).json({
      message: "successfully updated the chat history",
      updated: updatechathistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });

    console.log(error);
  }
}

export async function getmyallchats(req, res) {
  try {
    const getmychathistory = await chatmodel.find({
      username: req.params.username,
    });

    res.status(200).json({
      message: `successfully found all chathistor of ${req.params.username}`,
      getmychathistory: getmychathistory.map((i) => {
        //id to update chat history via updatechathistory
        return { chatdata: i.chathistoryofuser, id: i._id, time: i.createdAt };
      }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
}

export async function getmyaccinfo(req, res) {
  try {
    const getmydoc = await authmodel
      .findById(req.params.id)
      .select("-password");

    if (!getmydoc) {
      return res
        .status(404)
        .json({ message: `Id: ${req.params.id} not found to return doc` });
    }

    res.status(200).json({
      message: "successfuly found account info doc",
      getmydoc: getmydoc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
}

export async function savechats(req, res) {
  try {
    const create = new chatmodel({
      username: req.body.username,
      chathistoryofuser: req.body.chathistoryofuser,
    });

    const newdoc = await create.save();

    res
      .status(200)
      .json({ message: "chats saved successfully", savedid: newdoc._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
}

export async function deleteacandchats(req, res) {
  try {
    //delete all chat history by comparing unique usernames

    const getalluserschatsid = (
      await chatmodel.find({ username: req.params.username })
    ).map((i) => i.username);

    await chatmodel.deleteMany({ username: { $in: getalluserschatsid } });

    //delete account by id
    const find = await authmodel.findByIdAndDelete(req.params.id);

    if (!find) {
      return res
        .status(404)
        .json({ message: `username: ${req.params.username} not found ` });
    }

    res.status(200).json({
      message:
        "account and account related all chat records deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

      res.status(200).json({ message: "authorised user", token: token });
    } else {
      res.status(401).json({ message: "unauthorised user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
