#!/usr/bin/env bash

main() {
    local cmd=$1
    shift

    script_dir_name="`dirname \"$0\"`"              # relative
    PROJECT_DIR="`( cd \"${script_dir_name}/../\" && pwd )`"  # absolutized and normalized
    echo ${PROJECT_DIR}

  case ${cmd} in
    "all") test_lint && test_functional;;
    "func") test_functional;;
    "lint") test_lint;;
    "cov") test_coverage;;
    *) echo "Run as: $0 command
Possible commands:
  all     - run all tests
  func    - run functional tests
  lint    - run lint tests
  cov     - run coverage
  "; exit;;
  esac
}

test_lint(){
    # lint tests
    docker run -it --rm -v ${PROJECT_DIR}:/opt/pyide:ro registry.hub.docker.com/akayunov/pyide-test:latest bash -c \
    'echo "Run pycodestyle" && pycodestyle                         /opt/pyide/src/pyide /opt/pyide/test/client   /opt/pyide/test/server/tests && \
     echo "Run pyflakes"    && pyflakes                            /opt/pyide/src/pyide /opt/pyide/test/client   /opt/pyide/test/server/tests && \
     echo "Run pylint"      && pylint --rcfile=/opt/pyide/pylintrc /opt/pyide/src/pyide /opt/pyide/test/client/* /opt/pyide/test/server/tests/*  \
    '
}

test_functional(){
    # functional test
    docker run -it --rm -v "$PROJECT_DIR"/test:/opt/pyide/test:ro -v "$PROJECT_DIR"/tmp:/opt/pyide/tmp  --network=PYIDE_pyide \
        registry.hub.docker.com/akayunov/pyide-test:latest pytest /opt/pyide/test/client
}

test_coverage(){
    # get coverage
    docker run -it --rm -v "$PROJECT_DIR":/opt/pyide --add-host="pyide:127.0.0.1" --network='none' -e COVERAGE_PROCESS_START="/opt/pyide/.coveragerc" \
    -e COVERAGE_FILE="/opt/pyide/tmp/.coverage" registry.hub.docker.com/akayunov/pyide-test:latest bash -c \
    'cd /opt/pyide/src && \
     (python3 -m pyide --coverage 2>/dev/null 1>/dev/null &) && \
     pytest  --cov-config=/opt/pyide/.coveragerc --cov=/opt/pyide/src --cov=/opt/pyide/test /opt/pyide/test/client && \
     killall -2 python3 && \
     sleep 1 && \
     cd /opt/pyide/tmp && \
     coverage combine
    '
}

main "$@"
