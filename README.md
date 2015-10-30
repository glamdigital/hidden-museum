# Pocket Curator

## Developer

### Setup

Assuming that `npm` is installed:

    npm install

    bower install

###Generate settings bundle
In order to generate the settings bundle to enable picking of trail in iOS settings, run the following command.

```
node plugins/me.apla.cordova.app-preferences/bin/build-app-settings.js
```
This takes settings from app-settings.json and creates a settings bundle platforms/ios. This bundle must be added to the xcode project's Resources folder.

###Integrating image recognition library
The Moodstocks image recognition must be integrated as follows:
 - Download the framework from the moodstocks website.
 - Drag the Moodstocks Framework into the Frameworks folder of XCode.
 - Modify Classes/webViewDidFinishLoad to look like the following
```
- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    // Black base color for background matches the native apps
    theWebView.backgroundColor = [UIColor clearColor];
    theWebView.opaque = NO;

    return [super webViewDidFinishLoad:theWebView];
}
```
 - Modify Plugins/MS4Plugin.m to include the appropriate API key and secret.

### Building and running

```
grunt localbuild:ios
cordova run ios []--device]
```

### Importing data

The data for the app comes from the spreadsheet HiddenMuseumData on Google docs.

This sheet should be exported to .csv into a folder named HiddenMuseumData.

The following task then converts the data to the json format read by the app

    grunt convertData


### Cordova plugins
The app requires the following plugins:
 - com.moodstocks.phonegap 1.1.0 "MS4Plugin"
 - cordova-plugin-camera 1.2.1-dev "Camera"
 - cordova-plugin-media 1.0.2-dev "Media"
 - me.apla.cordova.app-preferences 0.4.5 "AppPreferences"
 - org.apache.cordova.device 0.3.0 "Device"
 - org.apache.cordova.dialogs 0.3.0 "Notification"
 - org.apache.cordova.file 1.3.3 "File"
 - org.apache.cordova.media 0.2.16 "Media"
 - org.apache.cordova.vibration 0.3.13 "Vibration"