import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Table } from "sst/node/table";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (event.body) {
    const body = JSON.parse(event.body);
    const { sessionId, otp } = body;

    if (!sessionId || !otp) {
      return {
        statusCode: 422,
        body: JSON.stringify({
          error: "otp and sessionId required",
          message: "Required fields not found",
        }),
      };
    }

    const pk = `${sessionId}#${otp}`;
    console.log("pk", pk);
    const command = new GetCommand({
      TableName: Table.Otp.tableName,
      Key: {
        pk: pk,
      },
    });

    const response = await docClient.send(command);

    if (
      response.Item &&
      response.Item["expireAt"] > Math.floor(new Date().getTime() / 1000)
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 403,
      body: JSON.stringify({
        error: true,
        message: "Invalid token, either incorrect or expired",
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
