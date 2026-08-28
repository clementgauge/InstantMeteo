#!/bin/bash
set -e

echo "=== Building Instant Météo France Native Android APK ==="

PROJECT_DIR="/tmp/climafrance_apk"
ANDROID_JAR="/tmp/android.jar"
R8_JAR="/tmp/r8.jar"
BIN_DIR="$PROJECT_DIR/bin"
KEYSTORE="/tmp/instantmeteo.keystore"

mkdir -p "$BIN_DIR"

echo "1. Generating R.java with aapt..."
aapt package -f -m \
  -J "$PROJECT_DIR/src" \
  -M "$PROJECT_DIR/AndroidManifest.xml" \
  -S "$PROJECT_DIR/res" \
  -I "$ANDROID_JAR"

echo "2. Compiling Java sources with javac..."
javac -d "$BIN_DIR" \
  -cp "$ANDROID_JAR" \
  -sourcepath "$PROJECT_DIR/src" \
  "$PROJECT_DIR/src/com/climafrance/precision"/*.java

echo "3. Converting bytecode to DEX with D8..."
java -cp "$R8_JAR" com.android.tools.r8.D8 \
  --min-api 21 \
  --lib "$ANDROID_JAR" \
  --output "$BIN_DIR" \
  $(find "$BIN_DIR" -name "*.class")

echo "4. Packaging APK with resources..."
aapt package -f \
  -M "$PROJECT_DIR/AndroidManifest.xml" \
  -S "$PROJECT_DIR/res" \
  -I "$ANDROID_JAR" \
  -F "$BIN_DIR/unaligned.apk"

echo "5. Adding classes.dex to APK..."
cd "$BIN_DIR"
aapt add unaligned.apk classes.dex
cd -

echo "6. Aligning APK with zipalign..."
rm -f "$BIN_DIR/aligned.apk"
zipalign -v -p 4 "$BIN_DIR/unaligned.apk" "$BIN_DIR/aligned.apk"

echo "7. Creating keystore (if needed)..."
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkey -v -keystore "$KEYSTORE" \
    -alias instantmeteo \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass instantmeteo123 \
    -keypass instantmeteo123 \
    -dname "CN=InstantMeteoFrance, OU=Mobile, O=InstantMeteoFrance, L=Paris, ST=IDF, C=FR"
fi

echo "8. Signing APK with apksigner (v1, v2, v3 schemes)..."
rm -f ./public/Instant-Meteo.apk ./public/Instant-Meteo-France.apk ./public/ClimaFrance-Precision.apk
apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:instantmeteo123 \
  --key-pass pass:instantmeteo123 \
  --out ./public/Instant-Meteo.apk \
  "$BIN_DIR/aligned.apk"

cp ./public/Instant-Meteo.apk ./public/Instant-Meteo-France.apk
cp ./public/Instant-Meteo.apk ./public/ClimaFrance-Precision.apk

echo "9. Verifying signed APK..."
apksigner verify --verbose ./public/Instant-Meteo.apk

echo "10. Inspecting APK contents..."
unzip -l ./public/Instant-Meteo.apk

echo "=== Instant-Meteo.apk successfully compiled and signed! ==="
ls -lh ./public/Instant-Meteo.apk ./public/Instant-Meteo-France.apk ./public/ClimaFrance-Precision.apk
