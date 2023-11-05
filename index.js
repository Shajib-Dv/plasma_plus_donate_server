/** @format */

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const mongoClient = require("./mongoClient");
const articleRoutes = require("./routes/articleRoutes");
const bloodRequestRoute = require("./routes/bloodRequest");

//middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {
    await mongoClient.connect();

    app.use("/", articleRoutes);
    app.use("/", bloodRequestRoute);

    await mongoClient.client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.json({ status: 200, message: "Server successfully connected" });
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
