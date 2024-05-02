import { StackContext, Table } from "sst/constructs";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";

export function StorageStack({ stack }: StackContext) {
  const table = new Table(stack, "Otp", {
    fields: {
      pk: "string",
      expireAt: "string",
      email: "string",
    },
    primaryIndex: {
      partitionKey: "pk",
    },
    stream: "new_image",
    timeToLiveAttribute: "expireAt",
    consumers: {
      sendEmail: {
        function: {
          functionName: "sendEmail",
          handler: "packages/functions/src/sendEmail.handler",
          timeout: 10,
          memorySize: "128 MB",
          environment: {
            FROM_ADDRESS: "jayaprakashaws3@gmail.com",
          },
          permissions: ["ses"],
        },
        filters: [{ eventName: ["INSERT"] }], // Triggers stream only on inserting record into dynamodb.
        cdk: {
          eventSource: {
            batchSize: 100,
            startingPosition: StartingPosition.TRIM_HORIZON,
          },
        },
      },
    },
  });

  stack.addOutputs({
    TableName: table.tableName,
    TableArn: table.tableArn,
  });

  return {
    table,
  };
}
