const jwt = require("jsonwebtoken");
const {sqlForPartialUpdate} = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("update company with data", function () {
    const data = {name: "miffy"};
    const {setCols, values} = sqlForPartialUpdate(data,{
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    expect(setCols).toEqual(`"${Object.keys(data)[0]}"=$1`);
    expect(values).toEqual(Object.values(data));
  });
  test("update user with data", function () {
    const data = {username: "miffy"};
    const {setCols, values} = sqlForPartialUpdate(data,{
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
        sqlForPartialUpdate(data,{
            numEmployees: "num_employees",
            logoUrl: "logo_url",
          });
    } catch (err) {
        expect(err.message).toBe("No data");
    }
  });
});