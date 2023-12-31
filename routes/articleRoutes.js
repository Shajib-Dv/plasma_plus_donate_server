/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");
const cors = require("cors");
router.use(cors());

const articleCollections = mongoClient.getDB().collection("Articles");

router.get("/article", async (req, res) => {
  const article = await articleCollections.find().sort({ date: -1 }).toArray();
  res.send(article);
});

router.post("/article", async (req, res) => {
  const article = req.body;
  const saveArticle = await articleCollections.insertOne(article);
  res.send(saveArticle);
});

router.put("/article/:id", async (req, res) => {
  const article = req.body;
  const id = req.params.id;

  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedArticle = {
    $set: {
      ...article,
    },
  };

  const saveArticle = await articleCollections.updateOne(
    filter,
    updatedArticle,
    options
  );
  res.send(saveArticle);
});

router.delete("/article/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const deletedArticle = await articleCollections.deleteOne(filter);
  res.send(deletedArticle);
});

module.exports = router;
