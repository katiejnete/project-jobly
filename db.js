"use strict";
/** Database setup for jobly. */
const { Client, types } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}

db.connect();

types.setTypeParser(1700, val => {
  return parseFloat(val);
});

module.exports = db;