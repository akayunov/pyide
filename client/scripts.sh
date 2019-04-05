#!/usr/bin/env bash

main() {
    local cmd=$1
    shift

  case ${cmd} in
    "tt") tt "$@";;
    *) echo "Run as: $0 command

Possible commands:
  tt    - run all tests
  "; exit 255;;
  esac
}

tt(){
    mocha "$@" test/functional/cursor.js
}

main "$@"
