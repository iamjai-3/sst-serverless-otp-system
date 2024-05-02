import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from "./stacks/StorageStack";

export default {
  config(_input) {
    return {
      name: "otp-system-serverless",
      region: "ap-south-1",
      profile: "jai",
    };
  },
  stacks(app) {
    if (app.stage !== "prod") {
      app.setDefaultRemovalPolicy("destroy");
    }
    app.stack(StorageStack);
    app.stack(ApiStack);
  },
} satisfies SSTConfig;
