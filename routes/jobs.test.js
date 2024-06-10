"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u3Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: 0.01,
    companyHandle: "c1",
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u3Token}`);
    newJob.id = 4;
    
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: newJob,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 100000,
        equity: 0.01,
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: -1,
        equity: 2,
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized request for not logged in", async function () {
    const resp = await request(app).post("/jobs").send({ newJob });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized request for not admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({ newJob })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 100000,
          equity: 0.01,
          companyHandle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 200000,
          equity: 0.02,
          companyHandle: "c2",
        },
        {
          id: 3,
          title: "j3",
          salary: 300000,
          equity: 0.03,
          companyHandle: "c3",
        },
      ],
    });
  });

  // test("filter with name", async () => {
  //   const resp = await request(app).get("/jobs?name=C1");
  //   expect(resp.body).toEqual({
  //     jobs: [
  //       {
  //         handle: "c1",
  //         name: "C1",
  //         description: "Desc1",
  //         numEmployees: 1,
  //         logoUrl: "http://c1.img",
  //       },
  //     ],
  //   });
  // });

  // test("filter with minEmployees and maxEmployees", async () => {
  //   const resp = await request(app).get("/jobs?minEmployees=2&maxEmployees=3");
  //   expect(resp.body).toEqual({
  //     jobs: [
  //       {
  //         handle: "c2",
  //         name: "C2",
  //         description: "Desc2",
  //         numEmployees: 2,
  //         logoUrl: "http://c2.img",
  //       },
  //       {
  //         handle: "c3",
  //         name: "C3",
  //         description: "Desc3",
  //         numEmployees: 3,
  //         logoUrl: "http://c3.img",
  //       },
  //     ],
  //   });
  // });

  // test("fails with inappropriate query string", async () => {
  //   const resp = await request(app).get("/jobs?doesNotExist=flaskjef");
  //   expect(resp.statusCode).toEqual(400);
  // });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: 
      {
        id: 1,
        title: "j1",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.body).toEqual({
      job: 
      {
        id: 1,
        title: "new",
        salary: 100000,
        equity: 0.01,
        companyHandle: "c1",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/1`).send({
      title: "new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized request for not admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        id: 33
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "new",
        salary: -1,
        equity: 2,
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for not admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${u3Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
