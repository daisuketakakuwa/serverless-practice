import mysql from "promise-mysql";

export function createDbConnection(): Promise<mysql.Connection | null> {
  return mysql
    .createConnection({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.NODE_ENV == "offline" ? 3309 : 3306,
      timezone: "jst",
    })
    .then((value) => {
      return value;
    })
    .catch((err: Error) => {
      console.log(err.message);
      return null;
    });
}
