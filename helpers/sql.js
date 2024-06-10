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

function sqlForFilterCompanies(data) {
  const keys = Object.keys(data);
  if (keys.length === 0) throw new BadRequestError("No data");

  if (data.minEmployees && data.maxEmployees) {
    if (data.minEmployees > data.maxEmployees)
      throw new BadRequestError(
        "minEmployees cannot be greater than maxEmployees"
      );
  }

  // {minEmployees: 2, maxEmployees: 3} => 'num_employees >= 2 AND num_employees <= 3'
  const cols = [];
  let idx = 0;
  for (let colName of keys) {
    if (colName.includes("name")) {
      cols.push(`"${colName}" ILIKE '%${data.name}%'`);
    } else if (colName.includes("min")) {
      cols.push(`"num_employees" >= ${data.minEmployees}`);
    } else {
      cols.push(`"num_employees" <= ${data.maxEmployees}`);
    }
    idx++;
  }
  if (cols.length > 1) return cols.join(" AND ");
  else return cols[0];
}

function sqlForFilterJobs(data) {
  const keys = Object.keys(data);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {title: "new", minSalary: 100000, hasEquity: true} => 'title = 'new' AND salary >= 100000 AND equity > 0'
  const cols = [];
  let idx = 0;
  for (let colName of keys) {
    if (colName.includes("title")) {
      cols.push(`"${colName}" ILIKE '%${data.title}%'`);
    } else if (colName.includes("min")) {
      cols.push(`"salary" >= ${data.minSalary}`);
    } else if (colName.includes("has")) {
      if (data.hasEquity) cols.push(`"equity" > 0`);
    }
    idx++;
  }
  if (cols.length > 1) return cols.join(" AND ");
  else return cols[0];
}

module.exports = { sqlForPartialUpdate, sqlForFilterCompanies, sqlForFilterJobs };
