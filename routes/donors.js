/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");

const donorsCollection = mongoClient.getDB().collection("Donors");

router.get("/donors", async (req, res) => {
  const donors = await donorsCollection.find().sort({ date: -1 }).toArray();
  res.send(donors);
});

router.get("/donors/search", async (req, res) => {
  const searchWords = req.query;
  const searchKey = Object.keys(searchWords);
  const filter = {};

  for (const key of searchKey) {
    filter[key] = { $regex: searchWords[key], $options: "i" };
  }
  try {
    if (Object.keys(filter).length > 0) {
      const result = await donorsCollection
        .find(filter)
        .sort({ date: -1 })
        .toArray();

      if (result.length > 0) {
        return result.send(result);
      } else {
        return res.send({ status: 200, message: "No donors found" });
      }
    } else {
      const result = await donorsCollection.find().sort({ date: -1 }).toArray();
      return res.send(result);
    }
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal Error",
      error: error?.message,
    });
  }
});

router.put("/donors/:id", async (req, res) => {
  const donor = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };

  const updatedDonor = {
    $set: { ...donor },
  };

  const result = await donorsCollection.updateOne(
    filter,
    updatedDonor,
    options
  );
  res.send(result);
});

router.delete("/donors/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const result = await donorsCollection.deleteOne(filter);
  res.send(result);
});

module.exports = router;
