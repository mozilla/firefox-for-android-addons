const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource://gre/modules/Home.jsm");
Cu.import("resource://gre/modules/HomeProvider.jsm");
Cu.import("resource://gre/modules/Messaging.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Task.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// The add-on ID defined in install.rdf.
const ADDON_ID = "ADDON.NAME@SOMEDOMAIN.ORG";

// Make these IDs unique, preferably tied to a domain that you own.
const PANEL_ID = "your.panel@somedomain.org";
const DATASET_ID = "your.dataset@somedomain.org";

// This file is just an example of what your XHR endpoint could return.
const DATA_URL = "chrome://youraddon/content/example-items.json";

// An example of how to create a string bundle for localization.
XPCOMUtils.defineLazyGetter(this, "Strings", function() {
  return Services.strings.createBundle("chrome://youraddon/locale/youraddon.properties");
});

// An example of how to import a helper module.
XPCOMUtils.defineLazyGetter(this, "Helper", function() {
  let sandbox = {};
  Services.scriptloader.loadSubScript("chrome://youraddon/content/helper.js", sandbox);
  return sandbox["Helper"];
});

function optionsCallback() {
  return {
    title: Strings.GetStringFromName("title"),
    views: [{
      type: Home.panels.View.LIST,
      dataset: DATASET_ID,
      // New in Firefox 32 (no-op in Firefox 31+)
      onrefresh: refreshDataset
    }],
    onuninstall: function() {
      // If your add-on only adds a panel and does nothing else, it is nice to
      // uninstall the add-on for users if they remove the panel in settings.
      AddonManager.getAddonByID(ADDON_ID, function(addon) {
        addon.uninstall();
      });
    },
    auth: {
      authenticate: function authenticate() {
        // … do some stuff to authenticate the user …
        Home.panels.setAuthenticated(PANEL_ID, true);
      }, 
      messageText: "Please log in to see your data",
      buttonText: "Log in"
    }
  };
}

// An example XHR request to fetch data for panel.
function fetchData(url, onFinish) {
  let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
  try {
    xhr.open("GET", url, true);
  } catch (e) {
    Cu.reportError("Error opening request to " + url + ": " + e);
    return;
  }
  xhr.onerror = function onerror(e) {
    Cu.reportError("Error making request to " + url + ": " + e.error);
  };
  xhr.onload = function onload(event) {
    if (xhr.status === 200) {
      onFinish(xhr.responseText);
    } else {
      Cu.reportError("Request to " + url + " returned status " + xhr.status);
    }
  };
  xhr.send(null);
}

function refreshDataset() {
  fetchData(DATA_URL, function(response) {
    Task.spawn(function() {
      let items = JSON.parse(response);
      let storage = HomeProvider.getStorage(DATASET_ID);

      // Old way to replace data for Firefox 30
      // yield storage.deleteAll();
      // yield storage.save(items);

      // New way to replace data for Firefox 31+
      yield storage.save(items, { replace: true });

    }).then(null, e => Cu.reportError("Error refreshing dataset " + DATASET_ID + ": " + e));
  });
}

function deleteDataset() {
  Task.spawn(function() {
    let storage = HomeProvider.getStorage(DATASET_ID);
    yield storage.deleteAll();
  }).then(null, e => Cu.reportError("Error deleting data from HomeProvider: " + e));
}

// Opens about:home to our new panel.
function openPanel() {
  Services.wm.getMostRecentWindow("navigator:browser").BrowserApp.loadURI("about:home?panel=" + PANEL_ID);
}

/**
 * bootstrap.js API
 * https://developer.mozilla.org/en-US/Add-ons/Bootstrapped_extensions
 */
function startup(data, reason) {
  // Always register your panel on startup.
  Home.panels.register(PANEL_ID, optionsCallback);

  switch(reason) {
    case ADDON_INSTALL:
    case ADDON_ENABLE:
      Home.panels.install(PANEL_ID);
      HomeProvider.requestSync(DATASET_ID, refreshDataset);
      break;

    case ADDON_UPGRADE:
    case ADDON_DOWNGRADE:
      Home.panels.update(PANEL_ID);
      break;
  }

  // Open the panel when the add-on is first installed.
  if (reason == ADDON_INSTALL) {
    openPanel();    
  }

  // Update data once every hour.
  // It is okay to call addPeriodicSync every time in order to update the callback.
  HomeProvider.addPeriodicSync(DATASET_ID, 3600, refreshDataset);
}

function shutdown(data, reason) {
  if (reason == ADDON_UNINSTALL || reason == ADDON_DISABLE) {
    // Call removePeriodicSync only when uninstalling or disabling,
    // because we still need periodic sync in other cases.
    HomeProvider.removePeriodicSync(DATASET_ID);

    Home.panels.uninstall(PANEL_ID);
    deleteDataset();
  }

  Home.panels.unregister(PANEL_ID);
}

function install(data, reason) {}

function uninstall(data, reason) {}
