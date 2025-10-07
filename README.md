# `sst diff` bug example repo.

## Background

We create a `live` alias for each of our deployed Lambda functions.
Any resources that point to the function, for example crons, bucket notifications, or API Gateway routes always point to this alias rather than `$LATEST` or a specific version.
This ensures that newly deployed function versions are smoke tested before they become active.

This is done using `aws.lambda.Alias`, as SST does not appear to provide this natively.

## The problem

Running an `sst diff` always shows some changes to `aws:lambda:Permission`, as it thinks we are setting the `function` to the fully-qualified function ARN with the alias at the end, and have removed `qualifier`.

Perhaps SST resources like `sst.aws.Cron` could either parse out the alias in this case, or alternatively accept a new type for `function` like `{ name: arn; qualifier: string; }`.

## Reproduction steps

1. Clone the repo
2. Run `sst deploy`
3. Run `sst diff`

### Expected behaviour

No changes, as we are running a diff without changing anything.

### Actual behaviour

Diff output as below:

```

SST 3.17.14  ready!

➜  App:        sst-thing
   Stage:      brad

~  Diff

|  Created     MyCron sst:aws:Cron → MyCronPermission aws:lambda:Permission
|  Deleted     MyCron sst:aws:Cron → MyCronPermission aws:lambda:Permission

↗  Permalink   https://sst.dev/u/f72a97be

✓  Generated

+  MyCron sst:aws:Cron → MyCronPermission aws:lambda:Permission
   * function = arn:aws:lambda:eu-west-2:<account-id>:function:sst-thing-brad-MyFunctionFunction-bamswodc:MyFunctionAlias-c76baba
   - qualifier
```
