const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function sqlForFilterCompanies(dataToFilter) {
  if (dataToFilter.minEmployees || dataToFilter.maxEmployees) {
    if (dataToFilter.minEmployees > dataToFilter.maxEmployees)
      throw new BadRequestError(
        "minEmployees cannot be greater than maxEmployees"
      );
  }
  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {minEmployees: 2, maxEmployees: 3} => ['num_employees >= 2 AND num_employees <= 3']
  const cols = [];
  let idx = 0;
  for (let colName of keys) {
    if (
      colName !== "name" &&
      colName !== "minEmployees" &&
      colName !== "maxEmployees"
    )
      throw new BadRequestError("Contains inappropriate filtering field(s)");
    if (colName.includes("name")) {
      cols.push(`"${colName}" LIKE '%${dataToFilter.name}%'`);
    } else if (colName.includes("min")) {
      cols.push(`"num_employees" >= ${dataToFilter.minEmployees}`);
    } else {
      cols.push(`"num_employees" <= ${dataToFilter.maxEmployees}`);
    }
    idx++;
  }
  if (cols.length > 1) return cols.join(" AND ");
  else return cols[0];
}

module.exports = { sqlForPartialUpdate, sqlForFilterCompanies };
