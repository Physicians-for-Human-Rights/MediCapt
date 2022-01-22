## Getting started

You will need to install some global tools:

```
npm install -g @aws-amplify/cli
npm install -g fs-minipass
npm install -g minizlib
npm install -g expo-cli
npm install -g sharp-cli
yarn install
```

When infrastructure that the app relies on changes you will want to run
`update-config.sh`. This requires that you have a terraform checkout.

## Run 

The website with `expo web`

Any changes that you make will lead to the website reloading.
