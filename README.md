# RadioDns mobile demonstrator

This demonstrator uses RadioDns metadata to operate an ip radio application. Currently we only support the development 
on Android but iOS is to come soon.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing
purposes. See deployment for notes on how to deploy the project on any app store.

### Prerequisites

Please follow the [Installing dependencies](https://facebook.github.io/react-native/docs/getting-started#installing-dependencies-1)
section of the react native documentation.

### Installing

To install development dependencies type into a terminal (with this directory as working directory)

    npm install

You must also install TypeScript and TSLint:

    npm install -g typescript tslint

## Running the tests

Coming soon!

## Running the application in local development

    npm run start:android
    
Ensure that you have an emulator or a physical device connected to your development device first.

## Deployment
### (Optional) Generate a signing key
Android requires that all apps be digitally signed with a certificate before they can be installed.
While this step is not required to generate an APK for testing purposes, it is mandatory if you intent to publish the app
to Google Play store.

You can generate this key by following the
[Generating a signing key](https://facebook.github.io/react-native/docs/signed-apk-android#generating-a-signing-key)
and [Setting up gradle variables](https://facebook.github.io/react-native/docs/signed-apk-android#setting-up-gradle-variables)
sections for the react native documentation.

Once your keystore is created you should place it under the `android/app` folder.

**Note: Remember to keep your keystore file private and never commit it to version control.**

### Building the APK

First build the Typescript sources with the following command:

    npm run build

Then bundle the application with the following command:

    react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

Finally build the APK with the following commands:

    cd android
    ./gradlew assembleRelease
    
If you got `Execution failed for task ':app:mergeReleaseResources'.` error message, delete the contents of all drawable folders.
Those folders are located under the `android/app/src/main/res` folder.
    
The generated APK can be found under `android/app/build/outputs/apk/release/app-release.apk`, and is ready to be distributed if you 
signed the APK.
    
## Contributing

Please read [CONTRIBUTING.md](https://github.com/ioannisNoukakis/radiodns_react_native_demo/CONTRIBUTING.md) for details on our code of
conduct, and the process for submitting pull requests to us.

## Authors

* **Ioannis Noukakis** - *Initial work* - [ioannisNoukakis](https://github.com/ioannisNoukakis)

See also the list of [contributors](https://github.com/ioannisNoukakis/radiodns_react_native_demo/contributors)
who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## TODO
- Write proper tests.
- Add a translation module.
- Add error reporter module.
