import { Api, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(StorageStack);

  const OTP_LENGTH = StringParameter.valueForStringParameter(
    stack,
    "OTP_LENGTH"
  ); // FROM PARAMETER STORE

  stack.setDefaultFunctionProps({
    memorySize: "128 MB",
    architecture: "arm_64",
    runtime: "nodejs18.x",
    logRetention: "one_day",
  });

  const api = new Api(stack, "Api", {
    routes: {
      "POST /otp/generate": {
        type: "function",
        function: {
          functionName: "generateOtp",
          handler: "packages/functions/src/generateOtp.handler",
          environment: {
            OTP_LENGTH: OTP_LENGTH,
          },
          bind: [table],
        },
      },

      "POST /otp/verify": {
        type: "function",
        function: {
          functionName: "verifyOtp",
          handler: "packages/functions/src/verifyOtp.handler",
          bind: [table],
        },
      },
    },
  });

  stack.addOutputs({
    ApiEndPoint: api.url,
  });

  return {
    api,
  };
}
