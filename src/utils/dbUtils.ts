import mysql from "promise-mysql";
import BlueBird from "bluebird";

export async function createDbConnection(): Promise<BlueBird<mysql.Connection>> {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.NODE_ENV == "offline" ? 3309 : 3306,
    timezone: "jst",
  });
}
