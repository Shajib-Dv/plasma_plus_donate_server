/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const teamCollections = mongoClient.getDB().collection("Team_members");

router.get("/team_member", cors(), async (req, res) => {
  const member = await teamCollections.find().toArray();
  res.send(member);
});

router.post("/team_member", cors(), async (req, res) => {
  const member = req.body;
  const result = await teamCollections.insertOne(member);
  res.send(result);
});

router.delete("/team_member/:id", cors(), async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await teamCollections.deleteOne(filter);
  res.send(result);
});

router.put("/team_member/:id", cors(), async (req, res) => {
  const member = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedMember = {
    $set: {
      ...member,
    },
  };

  const result = await teamCollections.updateOne(
    filter,
    updatedMember,
    options
  );
  res.send(result);
});

module.exports = router;
