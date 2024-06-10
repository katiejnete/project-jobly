"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {
  sqlForPartialUpdate,
  sqlForFilterCompanies,
} = require("../helpers/sql");
const jsonschema = require("jsonschema");
const companyFilterSchema = require("../schemas/companyFilter.json");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [handle, name, description, numEmployees, logoUrl]
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`
    );
    return companiesRes.rows;
  }

  /** Find all companies with filter.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAndFilter(data) {
    if (data.minEmployees) {
      data.minEmployees = parseInt(data.minEmployees);
    }
    if (data.maxEmployees) {
      data.maxEmployees = parseInt(data.maxEmployees);
    }
    const validator = jsonschema.validate(data, companyFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const cols = sqlForFilterCompanies(data);

    const querySql = `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"
                      FROM companies 
                      WHERE ${cols}`;
    const companiesRes = await db.query(querySql);
    if (!companiesRes.rows) throw new NotFoundError(`No companies found`);

    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl",
                  id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM companies AS c JOIN jobs AS j ON c.handle = j.company_handle
           WHERE handle = $1`,
      [handle]
    );
    if (!companyRes.rows.length)
    throw new NotFoundError(`No company: ${handle}`);
    const jobs = [];
    for (let row of companyRes.rows) {
      const { id, title, salary, equity, companyHandle } = row;
      jobs.push({ id, title, salary, equity, companyHandle });
    }
    const { name, description, numEmployees, logoUrl } = companyRes.rows[0];
    const company = { handle, name, description, numEmployees, logoUrl, jobs };

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]
    );
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}

module.exports = Company;
