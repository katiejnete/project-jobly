const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate, sqlForFilterCompanies, sqlForFilterJobs } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("update company with data", function () {
    const data = { name: "miffy" };
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    expect(setCols).toEqual(`"${Object.keys(data)[0]}"=$1`);
    expect(values).toEqual(Object.values(data));
  });
  
  test("update user with data", function () {
    const data = { username: "miffy" };
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    expect(setCols).toEqual(`"${Object.keys(data)[0]}"=$1`);
    expect(values).toEqual(Object.values(data));
  });

  test("update without data", function () {
    // try catch to catch error thrown when no data is sent
    try {
      const data = {};
      sqlForPartialUpdate(data, {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    } catch (err) {
      expect(err.message).toBe("No data");
    }
  });

  describe("sqlForFilterCompanies", () => {
    test("query string data contains name", () => {
      const data = { name: "and" };
      const cols = sqlForFilterCompanies(data);
      expect(cols).toEqual(`"name" ILIKE '%${data.name}%'`);
    });

    test("query string data contains minEmployees and maxEmployees", () => {
      const data = { minEmployees: 30, maxEmployees: 100 };
      const cols = sqlForFilterCompanies(data);
      expect(cols).toEqual(
        `"num_employees" >= ${data.minEmployees} AND "num_employees" <= ${data.maxEmployees}`
      );
    });

    test("query string data does not contain appropriate filtering fields", () => {
      try {
        const data = { doesNotExist: "flaskjf" };
        sqlForFilterCompanies(data);
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

  describe("sqlForFilterJobs", () => {
    test("query string data contains title", () => {
      const data = { title: "SWE" };
      const cols = sqlForFilterJobs(data);
      expect(cols).toEqual(`"title" ILIKE '%${data.title}%'`);
    });

    test("query string data contains minSalary and hasEquity", () => {
      const data = { minSalary: 100000, hasEquity: true };
      const cols = sqlForFilterJobs(data);
      expect(cols).toEqual(
        `"salary" >= ${data.minSalary} AND "equity" > 0`
      );
    });

    test("query string data does not contain appropriate filtering fields", () => {
      try {
        const data = { doesNotExist: "flaskjf" };
        sqlForFilterJobs(data);
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });
});
