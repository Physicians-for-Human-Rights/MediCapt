## Getting started

You will need to install some global tools:

```
npm install -g expo-cli
yarn install
```

When infrastructure that the app relies on changes you will want to run
`update-config.sh`. This requires that you have a terraform checkout. Or you ask
someone with access to the backend for the `config.json` file.

## Run

The website with `expo web`

On the phone with `expo start` Note that you also need to install the expo app.

Any changes that you make will lead to the website and the app reloading.

## Building on Android

```
sudo apt-get install openjdk-8-jdk

# Switch to java 8
sudo update-alternatives --config java

./sdkmanager --install "ndk;21.1.6352462"
/home/andrei/pkg/android-studio-sdk/tools/bin/sdkmanager --licenses

export ANDROID_SDK_ROOT=/home/andrei/pkg/android-studio-sdk
export ANDROID_NDK_HOME=/home/andrei/pkg/android-studio-sdk/ndk/24.0.8215888

expo run:android
```

## Form elements

If you add a new form element you need to plug that change through several parts
of the application. It probably needs to also exist as part of the record, and
not just the form. It will need to be added to the map function in forms.tsx
which will guide you to other locations to update. Don't forget to add a test
for that form element.
