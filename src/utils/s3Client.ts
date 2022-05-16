import AWS from "aws-sdk";
import * as stream from "stream";

let S3: AWS.S3 | null = null;
async function connectS3(): Promise<AWS.S3> {
  if (S3 == null) {
    if (process.env.NODE_ENV == "offline") {
      S3 = new AWS.S3({
        // force urls like http://{host}/{bucket}/{key} instead of http://{bucket}.
        s3ForcePathStyle: true,
        endpoint: new AWS.Endpoint(process.env.S3_ENDPOINT || ""),
        accessKeyId: "S3RVER",
        secretAccessKey: "S3RVER",
      });
    } else {
      S3 = new AWS.S3({
        // force urls like http://{host}/{bucket}/{key} instead of http://{bucket}.
        s3ForcePathStyle: true,
        endpoint: new AWS.Endpoint(process.env.S3_ENDPOINT || ""),
      });
    }
  }
  return S3;
}

export async function getObjectReadStream(key: string): Promise<stream.Readable> {
  const request: AWS.S3.GetObjectRequest = {
    Bucket: process.env.S3_BUCKET || "",
    Key: key,
  };
  const s3: AWS.S3 = await connectS3();
  return await s3
    .getObject(request)
    .createReadStream()
    .on("error", (err: Error) => {
      console.log(err);
      return null;
    });
}
