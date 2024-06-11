"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const Job = require("./job");
const { BadRequestError } = require("../expressError");

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
    const duplicateCheck = await db.query(`SELECT username, job_id FROM applications WHERE username = $1 AND job_id = $2`, [username, jobId]);
    if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate application for job id: ${jobId}`);
    
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
