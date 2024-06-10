"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

/** Related functions for applications. */

class Application {
  /** Create a application (from data), update db, return new application data.
   *
   * data should be { username, jobId }
   *
   * Returns { username, jobId }
   *
   * */

  static async create(username, jobId) {
    try {
      await db.query(
        `INSERT INTO applications
        (username, job_id)
        VALUES ($1, $2)`,
        [username, jobId]
      );
    } catch (err) {
      throw new NotFoundError(`No job id: ${jobId}`);
    }
  }
}

module.exports = Application;
