/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-thing",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const lambda = new sst.aws.Function("MyFunction", {
      handler: "lambda.handler",
    });

    const alias = new aws.lambda.Alias(
      "MyFunctionAlias",
      {
        functionName: lambda.name,
        functionVersion: "$LATEST",
      },

      // ignored as CI will update this after testing the newly deployed version
      { ignoreChanges: ["functionVersion"] },
    );

    // FIXME: underling aws:lambda:Permission always has changes like below:
    // * function = arn:aws:lambda:eu-west-2:<account-id>:function:sst-thing-brad-MyFunctionFunction-bamswodc:MyFunctionAlias-c76baba
    // - qualifier
    const cron = new sst.aws.Cron("MyCron", {
      function: alias.arn,
      schedule: "rate(1 day)",
    });
  },
});
