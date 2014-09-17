# Hub Boilerplate

This code is a template for building Firefox Hub add-ons for Firefox for Android.

For more information about building Hub add-ons, see:
https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/Firefox_Hub_Walkthrough

For more information about building mobile add-ons, please see:
https://developer.mozilla.org/en/Extensions/Firefox_on_Android

## Using the Hub Boilerplate

1. Edit `install.rdf`: Please change the ALL CAPS areas with text specific to your add-on.

2. Edit `bootstrap.js`: The current code includes an example of how to add a panel and refresh its data.

3. Edit `chrome.manifest`: Optionally use this to include additional files, including localization files.

4. Edit `build`: Update this file to specify a file name for your XPI, as well which version of Firefox you want to use to test the XPI file.

5. Run `./build`: This creates an XPI in your source directory and pushes it to your device. You must have [adb](http://developer.android.com/tools/help/adb.html) installed for the push step to work.

## Additional examples

Here is a list of existing add-ons that may serve as useful examples:

* https://github.com/leibovic/world-cup-feed
* https://github.com/leibovic/wikipedia-panel
* https://github.com/leibovic/instagram-panel
* https://github.com/leibovic/pocket-panel
* https://github.com/leibovic/vimeo-panel
* https://github.com/leibovic/catfacts
* https://github.com/leibovic/fennec_rss
