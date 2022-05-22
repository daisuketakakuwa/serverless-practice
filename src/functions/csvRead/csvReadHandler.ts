import { cargo } from "async";
import { S3Event } from "aws-lambda";
import { parse } from "csv-parse";
import iconv from "iconv-lite";
import { createDbConnection } from "../../utils/dbUtils";
import { getObjectReadStream } from "../../utils/s3Client";

export const runner = async (event: S3Event): Promise<number> => {
  const objectKey = event.Records[0].s3.object.key;

  // create db connection
  const mysqlConnection = await createDbConnection();
  if (!mysqlConnection) {
    return -1;
  }

  // configure a cargoQueue object with 2 tasks per worker
  const cargoQueue = cargo((rows, callback) => {
    let insertValues: string[] = [];
    rows.forEach((row) => {
      // rowsを組み立てる
      insertValues.push(row as unknown as string);
    });
    const statement = `INSERT INTO sample_user VALUES(${insertValues.join(",")})`;
    console.log(`executed: ${statement}`);
    try {
      mysqlConnection.query(statement);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
    callback();
  }, 50);

  let importedDataCount: number = 0;

  // configure how csv parser processes each row
  const parser = parse();
  parser.on("readable", () => {
    let row;
    while ((row = parser.read())) {
      cargoQueue.push([row]);
      importedDataCount++;
    }
  });
  // read csv file
  const csvReadStream = getObjectReadStream(objectKey);
  if (!csvReadStream) {
    return -1;
  }

  // write stream into csv parser
  csvReadStream.pipe(iconv.decodeStream("Shift_JIS")).pipe(parser);

  // end
  return await new Promise((resolve) => {
    csvReadStream.on("end", () => {
      console.log("//// CSV READ END");
      cargoQueue.drain(() => {
        console.log("//// CARGO READ END");
        resolve(importedDataCount);
      });
    });
  });
};
