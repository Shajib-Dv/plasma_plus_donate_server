/** @format */

const { MongoClient, ServerApiVersion } = require("mongodb");

const mongoURI = process.env.URI;

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
  await client.connect();
}

function getDB() {
  return client.db();
}

module.exports = { connect, getDB, client };
