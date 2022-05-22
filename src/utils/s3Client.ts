import AWS from "aws-sdk";
import * as stream from "stream";

const connectS3 = (): AWS.S3 => {
  if (process.env.NODE_ENV == "offline") {
    return new AWS.S3({
      // force urls like http://{host}/{bucket}/{key} instead of http://{bucket}.
      s3ForcePathStyle: true,
      endpoint: new AWS.Endpoint(process.env.S3_ENDPOINT || ""),
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
    });
  } else {
    return new AWS.S3({
      // force urls like http://{host}/{bucket}/{key} instead of http://{bucket}.
      s3ForcePathStyle: true,
      endpoint: new AWS.Endpoint(process.env.S3_ENDPOINT || ""),
    });
  }
};

const s3 = connectS3();

export const getObjectReadStream = (key: string): stream.Readable | null => {
  const request: AWS.S3.GetObjectRequest = {
    Bucket: process.env.S3_BUCKET || "",
    Key: key,
  };
  return s3
    .getObject(request)
    .createReadStream()
    .on("error", (err: Error) => {
      console.log(err);
      return null;
    });
};
