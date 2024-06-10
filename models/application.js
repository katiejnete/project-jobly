"use strict";

const db = require("../db");

/** Related functions for applications. */

class Application {
  /** Create a application (from data), update db, return new application data.
   *
   * data should be { username, jobId }
   *
   * Returns { username, jobId}
   *
   * */

  static async create({ username, jobId }) {
    const result = await db.query(
        `INSERT INTO applications
        (username, job_id)
        VALUES ($1, $2) RETURNING username, job_id AS "jobId"`
    ,[username, jobId]);
    return result.rows[0];
  }
}

module.exports = Application;
