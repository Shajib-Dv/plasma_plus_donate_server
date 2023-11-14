/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");

const campaignCollections = mongoClient.getDB().collection("Campaigns");

router.get("/campaigns", async (req, res) => {
  const campaignId = req.query.campaignId;
  const filter = { _id: new ObjectId(campaignId) };

  if (campaignId) {
    const result = await campaignCollections.findOne(filter);
    return res.send(result);
  }

  const campaigns = await campaignCollections
    .find()
    .sort({ date: -1 })
    .toArray();
  res.send(campaigns);
});

router.post("/campaigns", async (req, res) => {
  const campaign = req.body;
  const result = await campaignCollections.insertOne(campaign);
  res.send(result);
});

router.delete("/campaigns/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await campaignCollections.deleteOne(filter);
  res.send(result);
});

module.exports = router;
