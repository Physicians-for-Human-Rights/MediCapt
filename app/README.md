## Getting started

You will need to install some global tools:

```
npm install -g expo-cli
yarn install
```

When infrastructure that the app relies on changes you will want to run
`update-config.sh`. This requires that you have a terraform checkout.

## Run

The website with `expo web`

On the phone with `expo start` Note that you also need to install the expo app.

Any changes that you make will lead to the website and the app reloading.
