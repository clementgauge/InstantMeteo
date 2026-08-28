import os
import sys
import subprocess
import shutil
import zlib
import struct

PROJECT_DIR = "/tmp/climafrance_apk"
if os.path.exists(PROJECT_DIR):
    shutil.rmtree(PROJECT_DIR)

os.makedirs(f"{PROJECT_DIR}/src/com/climafrance/precision", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/layout", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/values", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/drawable", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/drawable-hdpi", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/drawable-xhdpi", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/drawable-xxhdpi", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/res/drawable-xxxhdpi", exist_ok=True)
os.makedirs(f"{PROJECT_DIR}/bin", exist_ok=True)

# 1. AndroidManifest.xml
manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.climafrance.precision"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden"
            android:label="@string/app_name">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""

with open(f"{PROJECT_DIR}/AndroidManifest.xml", "w") as f:
    f.write(manifest_content)

# 2. strings.xml, colors.xml, styles.xml
with open(f"{PROJECT_DIR}/res/values/strings.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">ClimaFrance Précision</string>
</resources>
""")

with open(f"{PROJECT_DIR}/res/values/colors.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#0284c7</color>
    <color name="background">#020617</color>
</resources>
""")

with open(f"{PROJECT_DIR}/res/values/styles.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.NoTitleBar.Fullscreen">
        <item name="android:windowBackground">@color/background</item>
    </style>
</resources>
""")

# 3. activity_main.xml
with open(f"{PROJECT_DIR}/res/layout/activity_main.xml", "w") as f:
    f.write("""<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:layout_gravity="top"
        android:indeterminate="false"
        android:max="100"
        android:visibility="gone" />
</FrameLayout>
""")

# 4. Helper to create a valid PNG icon
def create_png(width, height, color_rgb=(2, 132, 199)):
    # Create simple PNG
    raw_data = bytearray()
    r, g, b = color_rgb
    for y in range(height):
        raw_data.append(0) # filter type
        for x in range(width):
            # circle or square
            dx = (x - width / 2.0) / (width / 2.0)
            dy = (y - height / 2.0) / (height / 2.0)
            dist = dx*dx + dy*dy
            if dist <= 0.85:
                # Inside circle
                # sun/cloud color gradient
                gradient = int(255 * (1 - dy*0.3))
                raw_data.extend([min(255, r + 40), min(255, g + 20), min(255, b + 50), 255])
            else:
                raw_data.extend([0, 0, 0, 0])
                
    compressed = zlib.compress(bytes(raw_data))
    
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack('>I', crc)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    return png

for size, path in [
    (48, f"{PROJECT_DIR}/res/drawable/ic_launcher.png"),
    (72, f"{PROJECT_DIR}/res/drawable-hdpi/ic_launcher.png"),
    (96, f"{PROJECT_DIR}/res/drawable-xhdpi/ic_launcher.png"),
    (144, f"{PROJECT_DIR}/res/drawable-xxhdpi/ic_launcher.png"),
    (192, f"{PROJECT_DIR}/res/drawable-xxxhdpi/ic_launcher.png"),
]:
    with open(path, "wb") as f:
        f.write(create_png(size, size))

# 5. MainActivity.java
java_code = """package com.climafrance.precision;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

public class MainActivity extends Activity {
    private WebView mWebView;
    private ProgressBar mProgressBar;
    private static final String APP_URL = "https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF020617);
        }
        
        setContentView(R.layout.activity_main);

        mProgressBar = (ProgressBar) findViewById(R.id.progressBar);
        mWebView = (WebView) findViewById(R.id.webview);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " ClimaFranceNativeAndroid/1.0");

        mWebView.setBackgroundColor(0xFF020617);

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                mProgressBar.setVisibility(View.VISIBLE);
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                mProgressBar.setVisibility(View.GONE);
                super.onPageFinished(view, url);
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                mProgressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    mProgressBar.setVisibility(View.GONE);
                } else {
                    mProgressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });

        if (savedInstanceState != null) {
            mWebView.restoreState(savedInstanceState);
        } else {
            mWebView.loadUrl(APP_URL);
        }
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (mWebView != null) {
            mWebView.saveState(outState);
        }
    }
}
"""

with open(f"{PROJECT_DIR}/src/com/climafrance/precision/MainActivity.java", "w") as f:
    f.write(java_code)

print("Project generated successfully at", PROJECT_DIR)
