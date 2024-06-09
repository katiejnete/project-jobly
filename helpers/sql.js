const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function sqlForFilterCompanies(dataToFilter) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${colName}"=$${idx + 1}`,
  );

  // {minEmployees: 2, maxEmployees: 3} => ['num_employees >= 2 AND num_employees <= 3']
  const ops = [];
  if (keys.includes("minEmployees")) {
    ops.push(`num_employees >= ${dataToFilter.minEmployees}`);
  }
  if (keys.includes("maxEmployees")) {
    ops.push(`num_employees >= ${dataToFilter.maxEmployees}`);
  }
  if (keys.includes("minEmployees") && keys.includes("maxEmployees")) {
    ops.join("AND ");
  }

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
    setOperators: ops
  };  
}

module.exports = { sqlForPartialUpdate };
