import { S3Event } from "aws-lambda";
import os from "os";
import mysql from "promise-mysql";
import { Readable } from "stream";
import * as dbUtils from "../../utils/dbUtils";
import * as s3Client from "../../utils/s3Client";
import { runner } from "./csvReadHandler";

describe("csvReadHandler.runner test", () => {
  test("1. error: failed to connect to db", async () => {
    // mock dbUtils
    jest
      .spyOn(dbUtils, "createDbConnection")
      .mockReturnValue(new Promise((resolve) => resolve(null)));
    // s3Event
    const s3Event: S3Event = createS3Event();
    // execute
    const importedDataCount = await runner(s3Event);
    // assertion
    expect(importedDataCount).toBe(-1);
  });

  test("2. error: failed to read csv file", async () => {
    // mock dbUtils
    const mockMysqlConnection = {
      query: jest.fn().mockImplementation((options: string, values?: any) => {}),
    } as unknown as mysql.Connection;
    jest
      .spyOn(dbUtils, "createDbConnection")
      .mockReturnValue(new Promise((resolve) => resolve(mockMysqlConnection)));
    // mock s3Client.getObjectReadStream
    jest.spyOn(s3Client, "getObjectReadStream").mockReturnValue(null);

    // s3Event
    const s3Event: S3Event = createS3Event();
    // execute
    const importedDataCount = await runner(s3Event);
    // assertion
    expect(importedDataCount).toBe(-1);
  });

  test("3. ok", async () => {
    // mock dbUtils
    const mockMysqlConnection = {
      query: jest.fn().mockImplementation((options: string, values?: any) => {}),
    } as unknown as mysql.Connection;
    jest
      .spyOn(dbUtils, "createDbConnection")
      .mockReturnValue(new Promise((resolve) => resolve(mockMysqlConnection)));
    // mock s3Client.getObjectReadStream
    const records = [];
    for (let i = 1; i <= 100; i++) {
      records.push(`HELLO ${os.EOL}`);
    }
    const readStream = Readable.from(records);
    jest.spyOn(s3Client, "getObjectReadStream").mockReturnValue(readStream);

    // s3Event
    const s3Event: S3Event = createS3Event();
    // execute
    const importedDataCount = await runner(s3Event);
    // assertion
    expect(importedDataCount).toBe(100);
  });
});

const createS3Event = () => ({
  Records: [
    {
      eventVersion: "1",
      eventSource: "1",
      awsRegion: "region",
      eventTime: "time",
      eventName: "eventName",
      userIdentity: {
        principalId: "principalId",
      },
      requestParameters: {
        sourceIPAddress: "2",
      },
      responseElements: {
        "x-amz-id-2": "1",
        "x-amz-request-id": "id",
      },
      s3: {
        s3SchemaVersion: "version",
        configurationId: "id",
        bucket: {
          name: "name",
          ownerIdentity: {
            principalId: "",
          },
          arn: "arn",
        },
        object: {
          key: "key",
          size: 1,
          eTag: "eTab",
          versionId: "versionId",
          sequencer: "sequencer",
        },
      },
    },
  ],
});
