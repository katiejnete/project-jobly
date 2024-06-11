"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const Job = require("./job");

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
    await Job.get(jobId);
    const result = await db.query(
      `INSERT INTO applications
        (username, job_id)
        VALUES ($1, $2) RETURNING job_id AS "jobId"`,
      [username, jobId]
    );
    const application = result.rows[0];
    if (!application) throw new NotFoundError(`No job id: ${jobId}`);
  }
}

module.exports = Application;
