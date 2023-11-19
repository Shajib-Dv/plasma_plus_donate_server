/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const cors = require("cors");
router.use(cors());

const userCollections = mongoClient.getDB().collection("users");

router.get("/users", async (req, res) => {
  const email = req.query.email;
  const filter = { email: email };

  if (email) {
    const user = await userCollections.findOne(filter);
    return res.send(user);
  }

  const users = await userCollections.find().toArray();

  res.send(users);
});

router.post("/users", async (req, res) => {
  const user = req.body;
  user.role = "user";
  const storeUser = await userCollections.insertOne(user);
  res.send(storeUser);
});

router.put("/users/:email", async (req, res) => {
  const user = req.body;
  const email = req.params.email;
  const filter = { email: email };
  const options = { upsert: false };
  const updatedUser = {
    $set: {
      ...user,
    },
  };

  const result = await userCollections.findOneAndUpdate(
    filter,
    updatedUser,
    options
  );

  if (!result) {
    return res.send({ status: 200, message: "Couldn't find user !" });
  }

  res.send(result);
});

router.delete("/users/:email", async (req, res) => {
  const email = req.params.email;
  const filter = { email: email };
  const user = await userCollections.deleteOne(filter);
  res.send(user);
});

module.exports = router;
