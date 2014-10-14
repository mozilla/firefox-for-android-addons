// Some code snippets that use JNI.jsm

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyGetter(this, "JNI", function() {
  // Check to see if the public domain JNI.jsm is available in the tree (Firefox 34+).
  let scope = {};
  Cu.import("resource://gre/modules/JNI.jsm", scope);
  if (scope.JNI.GetForThread) {
    return scope.JNI;
  }

  // Othwerwise, fall back to import our own.
  Cu.import("chrome://privacycoach/content/JNI.jsm", scope);
  return scope.JNI;
});

// Opening a preference screen from JS.
let jenv;
try {
  jenv = JNI.GetForThread();

  let GeckoAppShell = JNI.LoadClass(jenv, "org.mozilla.gecko.GeckoAppShell", {
    static_methods: [
      { name: "getContext", sig: "()Landroid/content/Context;" },
    ],
  });
  let Intent = JNI.LoadClass(jenv, "android.content.Intent", {
    constructors: [
      { name: "<init>", sig: "(Landroid/content/Context;Ljava/lang/Class;)V" },
    ],
  });
  let GeckoPreferences = JNI.LoadClass(jenv, "org.mozilla.gecko.preferences.GeckoPreferences", {
    static_methods: [
      { name: "setResourceToOpen", sig: "(Landroid/content/Intent;Ljava/lang/String;)V" },
    ],
  });
  let Context = JNI.LoadClass(jenv, "android.content.Context", {
    methods: [
      { name: "startActivity", sig: "(Landroid/content/Intent;)V" },
    ],
  });

  let context = GeckoAppShell.getContext();
  let intent = Intent["new"](context, GeckoPreferences);

  // preferences_privacy is the resource name for the privacy screen.
  // All the preferences resources are defined here:
  // http://mxr.mozilla.org/mozilla-central/source/mobile/android/base/resources/xml/
  GeckoPreferences.setResourceToOpen(intent, "preferences_privacy");
  context.startActivity(intent);

} finally {
  if (jenv) {
    JNI.UnloadClasses(jenv);
  }
}
