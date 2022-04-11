Lambda functions
================

All lambda functions in the backend are written in typescript with strict mode
enabled. When updating a lambda function in `medicapt-infrastructure-modules`
you must run either `yarn build`, have `yarn watch` running, or just run
`tsc`. `dist-lambda` will contain compiled plain js version of typescript
code. Check the error output.

It's very important that `dist-lambda` is checked in. While build artifacts
don't normally belong in git, this is the actual code the system runs. Different
compiler versions can generate different code. Moreover, stable stages like prod
refer to specific git versions, those files must exist.

Dependencies are managed by lambda layers. There are two lambda layers. One
manages all modules that are needed `common_js_modules`. Place modules into the
`common_js_modules/nodejs/package.json` and they will be available once the
lambda layer is rebuilt. The other lambda layer manages any shared code,
`common_js_internal`. At the moment, this is only `common-types.ts` and
`common-utils.ts`. These should be imported plainly, as `'common-types'`. In
this manner typescript will find them both when you develop locally and when the
lambda code runs remotely.

NB: Due to a bug in terraform you must destroy the lambda layer and recreate it,
otherwise terraform won't create a new layer version.

Every endpoint is a separate lambda function with its own minimal permissions.

Every lambda function should validate its input, any data it attempts to put
into the store, and anything it returns to the client. `common-types.ts`
contains schemas for validating all types with `zod`.

NB: The default `policy.json` for lambda functions has a useless policy that
denies access to EC2. Lambda functions don't have EC2 permissions anyway and we
don't use EC2. But there's no way to create an empty AWS policy as a
placeholder, so we create a useless one instead.

### APIs

Query APIs can contain filters. All filters are standardized to be
`filter=[{field: {op: value}}]`.  For now, only string fields are supported with
the `eq` and `contains` ops.

Query APIs can sort. All sorts are standardized to be `sort=[{inc: field1},
{dec: field2}]`.
