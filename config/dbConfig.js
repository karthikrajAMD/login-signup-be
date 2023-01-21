const mongodb = require("mongodb");
const mongoose = require("mongoose");
const dbName = process.env.DB_NAME;
const dbUrl = process.env.DB_URL;

module.exports = { mongodb, mongoose, dbName, dbUrl };
