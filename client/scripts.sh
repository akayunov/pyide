#!/usr/bin/env bash

main() {
    local cmd=$1
    shift

  case ${cmd} in
    "test") tt "$@";;
    *) echo "Run as: $0 command

Possible commands:
  test    - run all tests
  "; exit 255;;
  esac
}

tt(){
    mocha "$@" test/functional/*
}

main "$@"
