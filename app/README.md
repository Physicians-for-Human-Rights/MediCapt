You will need to install some global tools:

npm install -g @aws-amplify/cli
npm install fs-minipass --global
npm install minizlib --global
npm install -g expo-cli
npm install -g sharp-cli

When infrastructure that the app relies on changes you will want to:

(cd ..; update-config.sh)

To import these pieces into the app
