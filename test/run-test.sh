#!/usr/bin/env bash

main() {
    local cmd=$1
    shift

    script_dir_name="`dirname \"$0\"`"              # relative

    PROJECT_DIR_ON_HOST="`( cd \"${script_dir_name}/../\" && pwd )`"  # absolutized and normalized
    PROJECT_DIR_ON_GUEST='/opt/pyide'
    
    echo 'PROJECT_DIR_ON_HOST:  ' ${PROJECT_DIR_ON_HOST}
    echo 'PROJECT_DIR_ON_GUEST: ' ${PROJECT_DIR_ON_GUEST}

  case ${cmd} in
    "all") test_lint && test_functional && test_coverage;;
    "func") test_functional "$@";;
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
    docker run -it --rm \
        -v ${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST}:ro \
        --network='none' registry.hub.docker.com/akayunov/pyide-test:latest \
        bash -c \
            "echo 'Run pycodestyle' && pycodestyle                                      ${PROJECT_DIR_ON_GUEST}/src/pyide ${PROJECT_DIR_ON_GUEST}/test/client   ${PROJECT_DIR_ON_GUEST}/test/server/tests && \
             echo 'Run pyflakes'    && pyflakes                                         ${PROJECT_DIR_ON_GUEST}/src/pyide ${PROJECT_DIR_ON_GUEST}/test/client   ${PROJECT_DIR_ON_GUEST}/test/server/tests && \
             echo 'Run pylint'      && pylint --rcfile=${PROJECT_DIR_ON_GUEST}/pylintrc ${PROJECT_DIR_ON_GUEST}/src/pyide ${PROJECT_DIR_ON_GUEST}/test/client/* ${PROJECT_DIR_ON_GUEST}/test/server/tests/*  \
            "
}

test_functional(){
    if [ -z $(docker stack ls   --format '{{ lower .Name}}' | grep  pyide) ]
    then
        docker stack deploy -c "$PROJECT_DIR_ON_HOST/build/docker-compose.yml" PYIDE
    else
        echo 'Sighuping container...'
        docker kill -s SIGHUP $(docker ps -a -f ancestor=akayunov/pyide:latest --format={{.ID}})
    fi

    # functional test
    docker run -it --rm \
        -v "${PROJECT_DIR_ON_HOST}/test":${PROJECT_DIR_ON_GUEST}/test:ro \
        -v "${PROJECT_DIR_ON_HOST}/tmp":${PROJECT_DIR_ON_GUEST}/tmp \
        --network=PYIDE_pyide \
        registry.hub.docker.com/akayunov/pyide-test:latest pytest $@ ${PROJECT_DIR_ON_GUEST}/test/client
}

test_coverage(){
    local push_cov=$1
    shift

    case ${push_cov} in
    "") ;;
    "push") ;;
    *) echo "Run as: $0 cov

Possible options:
  push  - push coverage on coveralls.io
  ''    - get local coverage only(see ./tmp)
  "; exit;;
    esac

    # get coverage
    docker run -it --rm \
        -v "${PROJECT_DIR_ON_HOST}":${PROJECT_DIR_ON_GUEST} \
        --add-host="pyide:127.0.0.1" \
        --network='none' \
        -e PROJECT_DIR_ON_GUEST=${PROJECT_DIR_ON_GUEST} \
        -e COVERAGE_PROCESS_START="${PROJECT_DIR_ON_GUEST}/.coveragerc" \
        -e COVERAGE_FILE="${PROJECT_DIR_ON_GUEST}/tmp/.coverage" registry.hub.docker.com/akayunov/pyide-test:latest \
        bash -c \
            "cd ${PROJECT_DIR_ON_GUEST}/src && \
             (python3 -c 'import coverage, signal, sys; signal.signal(signal.SIGINT, lambda x, y: sys.exit()); coverage.process_startup(); import pyide; pyide.main()' 2>/dev/null 1>/dev/null &) && \
             pytest  --cov-config=${PROJECT_DIR_ON_GUEST}/.coveragerc --cov=${PROJECT_DIR_ON_GUEST}/src --cov=${PROJECT_DIR_ON_GUEST}/test --cov-report= ${PROJECT_DIR_ON_GUEST}/test/client && \
             killall -2 python3 && \
             sleep 1
            "
    # send report
    local command="cd ${PROJECT_DIR_ON_GUEST}/tmp && coverage combine  && coverage report  && coverage html "
    if [ $1 ]
    then
        command="${command} &&  coveralls"
    fi
    docker run -it --rm \
        -v ${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST} \
        -e COVERALLS_REPO_TOKEN="w6LHqcB4LPnEK3RfkEFY4C9F7SPFwqGFN" \
        registry.hub.docker.com/akayunov/pyide-test:latest \
        bash -c "${command}"

}

main "$@"
