Lambda functions
================

All lambda functions in the backend are written in typescript with strict mode
enabled. When updating a lambda function in `medicapt-infrastructure-modules`
you must run either `yarn build` or have `yarn watch` running. `dist-lambda`
will contain compiled plain js version of typescript code.

It's very important that `dist-lambda` is checked in! While build artifacts
don't normally belong in git, this is the actual code the system runs. Different
compiler versions can generate different code. Moreover, stable stages like prod
refer to specific git versions, those files must exist.

Dependencies are managed by layers containing individual or small collections of
libraries.

Every endpoint is a separate lambda function with its own minimal permissions.
