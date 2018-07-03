#!/usr/bin/env sh
# couldnt figure out undocumented 'output template' mode for pkg so wrote this
# also need to include .node files until pkg supports including them in binary

NODE_ABI="node-57"
VERSION=$(node -pe "require('./package.json').version")

rm -rf dist

mkdir dist
mkdir builds/dpack-$VERSION-linux-x64
mkdir builds/dpack-$VERSION-macos-x64
mkdir builds/dpack-$VERSION-win-x64

mv builds/dpack-linux builds/dpack-$VERSION-linux-x64/dpack
mv builds/dpack-macos builds/dpack-$VERSION-macos-x64/dpack
mv builds/dpack-win.exe builds/dpack-$VERSION-win-x64/dpack.exe

cp node_modules/utp-native/prebuilds/linux-x64/$NODE_ABI.node builds/dpack-$VERSION-linux-x64/
cp node_modules/utp-native/prebuilds/darwin-x64/$NODE_ABI.node builds/dpack-$VERSION-macos-x64/
cp node_modules/utp-native/prebuilds/win32-x64/$NODE_ABI.node builds/dpack-$VERSION-win-x64/

cp LICENSE builds/dpack-$VERSION-linux-x64/
cp LICENSE builds/dpack-$VERSION-macos-x64/
cp LICENSE builds/dpack-$VERSION-win-x64/

cp README.md builds/dpack-$VERSION-linux-x64/README
cp README.md builds/dpack-$VERSION-macos-x64/README
cp README.md builds/dpack-$VERSION-win-x64/README

cd builds
../node_modules/.bin/cross-zip dpack-$VERSION-linux-x64 ../dist/dpack-$VERSION-linux-x64.zip
../node_modules/.bin/cross-zip dpack-$VERSION-macos-x64 ../dist/dpack-$VERSION-macos-x64.zip
../node_modules/.bin/cross-zip dpack-$VERSION-win-x64 ../dist/dpack-$VERSION-win-x64.zip

rm -rf builds

# now travis will upload the 3 zips in dist to the release
