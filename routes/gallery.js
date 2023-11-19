/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");
const cors = require("cors");
router.use(cors());

const galleryCollections = mongoClient.getDB().collection("Gallery");

router.get("/gallery", async (req, res) => {
  const gallery = await galleryCollections.find().sort({ date: -1 }).toArray();
  res.send(gallery);
});

router.post("/gallery", async (req, res) => {
  const photo = req.body;
  const result = await galleryCollections.insertOne(photo);
  res.send(result);
});

router.delete("/gallery/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await galleryCollections.deleteOne(filter);
  res.send(result);
});

module.exports = router;
