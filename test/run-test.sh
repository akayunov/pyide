#!/usr/bin/env bash

main() {
    local cmd=$1
    shift
    local push_cov=$1
    shift

    script_dir_name="`dirname \"$0\"`"              # relative
    PROJECT_DIR="`( cd \"${script_dir_name}/../\" && pwd )`"  # absolutized and normalized
    echo 'PROJECT DIR: ' ${PROJECT_DIR}

  case ${push_cov} in
    "") ;;
    "push") ;;
    *) echo "Run as: $0 cov
Possible options:
  push  - push coverage on coveralls.io
  ''    - get local coverage only(see ./tmp)
  "; exit;;
  esac

  case ${cmd} in
    "all") test_lint && test_functional;;
    "func") test_functional;;
    "lint") test_lint;;
    "cov") test_coverage $push_cov;;
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
    docker run -it --rm -v ${PROJECT_DIR}:/opt/pyide:ro --network='none' registry.hub.docker.com/akayunov/pyide-test:latest bash -c \
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
     (python3 -c "import coverage, signal, sys; signal.signal(signal.SIGINT, lambda x, y: sys.exit()); coverage.process_startup(); import pyide; pyide.main()" 2>/dev/null 1>/dev/null &) && \
     pytest  --cov-config=/opt/pyide/.coveragerc --cov=/opt/pyide/src --cov=/opt/pyide/test --cov-report= /opt/pyide/test/client && \
     killall -2 python3 && \
     sleep 1
    '
    # send report
    local command='cd /opt/pyide/tmp && coverage combine  && coverage report  && coverage html '
    if [ $1 ]
    then
        command="$command &&  coveralls"
    fi
    docker run -it --rm -v "$PROJECT_DIR":/opt/pyide -e COVERALLS_REPO_TOKEN="w6LHqcB4LPnEK3RfkEFY4C9F7SPFwqGFN" \
    registry.hub.docker.com/akayunov/pyide-test:latest bash -c "$command"

}

main "$@"
