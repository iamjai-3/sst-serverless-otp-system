import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Table } from "sst/node/table";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const OTP_EXPIRY_IN_MINUTES = 10;

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (event.body) {
    const body = JSON.parse(event.body);
    const { email } = body;

    const sessionId = uuidv4();
    const otp = generateOTP(Number(process.env.OTP_LENGTH));

    const input = {
      Item: {
        pk: `${sessionId}#${otp}`,
        expireAt:
          Math.floor(new Date().getTime() / 1000) * OTP_EXPIRY_IN_MINUTES * 60,
        email: email,
      },
      TableName: Table.Otp.tableName,
    };

    const command = new PutCommand(input);
    const response = await docClient.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({
        sessionId,
        response,
      }),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: true,
      message: "Internal server error, please contact admin",
    }),
  };
};

function generateOTP(length: number): string {
  const characters = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    OTP += characters[randomIndex];
  }

  return OTP;
}
