"use strict";

const db = require("../db.js");
const Application = require("./application.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { NotFoundError } = require("../expressError.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newApp = {
    username: "u1",
    jobId: 1,
  };

  test("works", async function () {
    await Application.create(newApp.username, newApp.jobId);
    const res = await db.query(`
    SELECT username, job_id AS "jobId" FROM applications WHERE username = 'u1'`);
    expect(res.rows).toEqual([
      {
        username: "u1",
        jobId: 1,
      },
    ]);
  });

  test("error for non-existing job", async function () {
    try {
      await Application.create(newApp.username, 0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
