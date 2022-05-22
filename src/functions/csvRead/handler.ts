import { cargo } from "async";
import { S3Event } from "aws-lambda";
import { parse, Parser } from "csv-parse";
import iconv from "iconv-lite";
import mysql from "promise-mysql";
import { createDbConnection } from "../../utils/dbUtils";
import { getObjectReadStream } from "../../utils/s3Client";

export const run = async (event: S3Event) => {
  if (!event.Records || event.Records.length == 0) {
    return null;
  }
  const objectKey = event.Records[0].s3.object.key;

  // configure a cargoQueue object with 2 tasks per worker
  const cargoQueue = cargo(async (rows, callback) => {
    rows.forEach((row) => {
      const statement = `INSERT INTO sample_user VALUES(${row})`;
      console.log(`executed: ${statement}`);
      mysqlConnection.query(statement);
    });
    callback();
  }, 2);

  // create db connection
  const mysqlConnection: mysql.Connection = await createDbConnection();

  // configure how csv parser processes each row
  const parser: Parser = parse();
  parser.on("readable", () => {
    let row;
    while ((row = parser.read())) {
      cargoQueue.push([row]);
    }
  });
  // read csv file
  const csvReadStream = await getObjectReadStream(objectKey);
  // write stream into csv parser
  csvReadStream.pipe(iconv.decodeStream("Shift_JIS")).pipe(parser);
  // end
  return new Promise((resolve) => {
    csvReadStream.on("end", () => {
      cargoQueue.drain(async () => {
        // delete s3 file
      });
      resolve(true);
    });
  });
};
