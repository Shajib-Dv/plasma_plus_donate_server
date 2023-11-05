/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");

const bloodRequestCollections = mongoClient.getDB().collection("Blood_request");

router.get("/blood_request", async (req, res) => {
  const limitTxt = req.query.limit;
  const limit = parseInt(limitTxt);
  const bloods = await bloodRequestCollections
    .find()
    .limit(limit)
    .sort({ date: -1 })
    .toArray();
  res.send(bloods);
});

router.post("/blood_request", async (req, res) => {
  const bloodInfo = req.body;
  const blood = await bloodRequestCollections.insertOne(bloodInfo);
  res.send(blood);
});

router.delete("/blood_request/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const deletedBlood = await bloodRequestCollections.deleteOne(filter);

  res.send(deletedBlood);
});

module.exports = router;
