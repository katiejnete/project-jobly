"use strict";

const db = require("../db");

/** Related functions for applications. */

class Application {
  /** Create a application (from data), update db, return new application data.
   *
   * data should be { username, jobId }
   *
   * Returns undefined
   *
   * */

  static async create({ username, jobId }) {
    await db.query(
        `INSERT INTO applications
        (username, job_id)
        VALUES ($1, $2)`
    ,[username, jobId]);
    return;
  }
}

module.exports = Application;
