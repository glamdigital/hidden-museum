# Sensing Evolution

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
