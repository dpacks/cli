#!/bin/bash

# gets latest dPack release zip for platform and extracts runnable binary into ~/.dpack
# usage: wget -qO- https://raw.githubusercontent.com/dpacks/cli/master/bin/install.sh | bash
# based on https://github.com/jpillora/installer/blob/master/scripts/download.sh

DPACK_DIR="$HOME/.dpack/releases"

function cleanup {
	rm -rf $DPACK_DIR/tmp.zip > /dev/null
}

function fail {
	cleanup
	msg=$1
	echo "============"
	echo "Error: $msg" 1>&2
	exit 1
}

function install {
  # bash check
  [ ! "$BASH_VERSION" ] && fail "Please use bash instead"
	GET=""
	if which curl > /dev/null; then
		GET="curl"
		GET="$GET --fail -# -L"
	elif which wget > /dev/null; then
		GET="wget"
		GET="$GET -qO-"
	else
		fail "neither wget/curl are installed"
	fi
  case `uname -s` in
  Darwin) OS="macos";;
  Linux) OS="linux";;
  *) fail "unsupported os: $(uname -s)";;
  esac
  if uname -m | grep 64 > /dev/null; then
  	ARCH="x64"
  else
  	fail "only arch x64 is currently supported for single file install. please use npm instead. your arch is: $(uname -m)"
  fi
  echo "Fetching latest dPack release version from GitHub"
  LATEST=$($GET -qs https://api.github.com/repos/dpacks/cli/releases/latest | grep tag_name | head -n 1 | cut -d '"' -f 4);
	mkdir -p $DPACK_DIR || fail "Could not create directory $DPACK_DIR, try manually downloading zip and extracting instead."
	cd $DPACK_DIR
  RELEASE="dpack-${LATEST:1}-${OS}-${ARCH}"
  URL="https://github.com/dpacks/cli/releases/download/${LATEST}/${RELEASE}.zip"
	which unzip > /dev/null || fail "unzip is not installed"
  echo "Downloading $URL"
	bash -c "$GET $URL" > $DPACK_DIR/tmp.zip || fail "download failed"
	unzip -o -qq $DPACK_DIR/tmp.zip || fail "unzip failed"
  BIN="$DPACK_DIR/$RELEASE/dweb"
	chmod +x $BIN || fail "chmod +x failed"
	cleanup
  printf "dPack $LATEST has been downloaded successfully. Execute it with this command:\n\n${BIN}\n\nAdd it to your PATH with this command (add this to .bash_profile/.bashrc):\n\nexport PATH=\"\$PATH:$DPACK_DIR/$RELEASE\"\n"
}

install
