#!/usr/bin/env bash

main() {
    local cmd=$1
    shift

  case ${cmd} in
    "test") test;;
    *) echo "Run as: $0 command

Possible commands:
  test    - run all tests
  "; exit 255;;
  esac
}

test(){
    PATH=/home/pyide/pyide/client/node_modules/chromedriver/bin:$PATH ./node_modules/.bin/mocha test/functional/cursor.js
}

main "$@"
