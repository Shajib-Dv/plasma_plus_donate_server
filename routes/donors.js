/** @format */

const express = require("express");
const router = express.Router();
const mongoClient = require("../mongoClient");
const { ObjectId } = require("mongodb");

const redis = require("redis");
const { promisify } = require("util");
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const getDifferenceOfDate = require("../utils/getDifferenceOfDate");
const cors = require("cors");
router.use(cors());

const donorsCollection = mongoClient.getDB().collection("Donors");
const donorLogCollection = mongoClient.getDB().collection("Donor_Log");

router.get("/donors/length", async (req, res) => {
  const length = await donorsCollection.estimatedDocumentCount();
  res.send({ totalDonors: length });
});

router.get("/donor/log", async (req, res) => {
  const donorID = req.query.donorId;
  const donorFilter = { _id: new ObjectId(donorID) };
  const donationFilter = { donorId: donorID };

  if (donorID) {
    const donor = await donorsCollection.findOne(donorFilter);

    const donations = await donorLogCollection
      .find(donationFilter)
      .sort({ date: -1 })
      .toArray();

    return res.send({ donor, donations });
  }
  const donors = await donorLogCollection.find().sort({ date: -1 }).toArray();
  res.send(donors);
});

router.get("/donors/search", async (req, res) => {
  const searchWords = req.query;
  const { page, limit, ...leftKeys } = searchWords;
  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);

  const skip = pageInt * limitInt;
  console.log(skip);

  const searchKey = Object.keys(leftKeys);
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
        return res.send(result);
      } else {
        return res.send({ status: 200, message: "No donors found" });
      }
    } else {
      const result = await donorsCollection
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .toArray();
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

router.post("/donors", async (req, res) => {
  const donor = req.body;
  const { lastDonation } = donor;
  const dateDifference = await getDifferenceOfDate(lastDonation);

  if (dateDifference >= 100) {
    donor.isAbleToDonate = "true";
  } else {
    donor.isAbleToDonate = "false";
  }

  const result = await donorsCollection.insertOne(donor);
  res.send(result);
});

router.post("/donor/log", async (req, res) => {
  const donorInfo = req.body;

  const result = await donorLogCollection.insertOne(donorInfo);
  res.send(result);
});

router.put("/donors/:id", async (req, res) => {
  const donor = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };

  const updatedDonor = {
    $set: { ...donor },
    $inc: { donationCount: 1 },
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

const updateDonationStatus = async () => {
  try {
    // Check if the lock exists
    const lock = await getAsync("donation_status_lock");
    if (!lock) {
      // Acquire the lock
      await setAsync("donation_status_lock", "locked", "EX", 86400); // Lock for 24 hours

      const donorsToUpdate = await donorsCollection
        .find({
          lastDonation: { $exists: true },
        })
        .toArray();

      donorsToUpdate.forEach(async (donor) => {
        const lastDonationDate = new Date(donor.lastDonation);
        const nextDonationDate = new Date(lastDonationDate);
        nextDonationDate.setDate(lastDonationDate.getDate() + 100);

        if (new Date() > nextDonationDate) {
          await donorsCollection.updateOne(
            { _id: new ObjectId(donor._id) },
            { $set: { isAbleToDonate: "true" } }
          );
        }
      });
      // Release the lock
      await client.del("donation_status_lock");
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = router;
