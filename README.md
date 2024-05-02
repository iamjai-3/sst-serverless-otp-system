npx create-sst@latest --template=base/example otp-system-serverless

pnpm install

cd packages\functions

pnpm install uuid

pnpm install -D @aws-sdk/client-ses @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @types/uuid
