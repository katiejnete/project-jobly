"use strict";

const db = require("../db.js");
const Application = require("./application.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newApp = {
    username: "u1",
    jobId: 1
  };

  test("works", async function () {
      await Application.create(newApp.username, newApp.jobId);
  
      const result = await db.query(
        `SELECT username, job_id AS "jobId"
             FROM applications
             WHERE username = 'u1'`
      );
    expect(result.rows).toEqual([
      {
        username: "u1",
        jobId: 1
      },
    ]);
  });
});