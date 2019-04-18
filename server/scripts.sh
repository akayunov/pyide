#!/usr/bin/env bash

script_dir_name="`dirname \"$0\"`"              # relative

PROJECT_DIR_ON_HOST="`( cd \"${script_dir_name}/\" && dirname $(pwd) )`"  # absolutized and normalized
PROJECT_DIR_ON_GUEST='/home/pyide/pyide'
HOME_DIR_ON_GUEST='/home/pyide'

echo 'PROJECT_DIR_ON_HOST:  ' ${PROJECT_DIR_ON_HOST}
echo 'PROJECT_DIR_ON_GUEST: ' ${PROJECT_DIR_ON_GUEST}

main() {
    local cmd=$1
    shift

  case ${cmd} in
    "all") test_lint && test_functional && (test_coverage $@);;
    "func") test_functional "$@";;
    "lint") test_lint;;
    "cov") test_coverage "$@";;
    "reinit") reinit;;
    "enter") enter "$@";;
    "enter-test") enter_test "$@";;
    "telnet") telnet_db;;
    "log") log;;
    "pycharm") pycharm;;
    *) echo "Run as: $0 command

Possible commands:
  all     - run all tests
  func    - run functional_old tests
  lint    - run lint tests
  cov     - run coverage
  reinit  - reinit stack
  telnet  - remote debug
  log     - show logs
  "; exit 255;;
  esac
}

reinit(){
    echo 'Run server container'

    if [[ $(docker container ls -a -q --filter=STATUS=exited --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1) ]]
    then
        docker container rm $(docker container ls -a -q --filter=STATUS=exited --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1)
    fi

    if [[ $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1) ]]
    then
        docker container stop $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1)
    fi

    docker run \
        -d \
        --rm \
        -e PYTHONPATH=/home/pyide/pyide/server/src \
        -e PYTHONUNBUFFERED=true \
        -p=31415:31415 \
        -p=5555:5555 \
        -v ${PROJECT_DIR_ON_HOST}/server:${PROJECT_DIR_ON_GUEST}/server:ro \
        -v ${PROJECT_DIR_ON_HOST}/client:${PROJECT_DIR_ON_GUEST}/client:ro \
        --log-driver=json-file \
        registry.hub.docker.com/akayunov/pyide:0.1 \
        watchmedo auto-restart -p='*.py' --recursive --ignore-directories  python3 -- -m pyide -d
}

log (){
    docker logs -f --tail=100 $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1)
}

enter(){
    if [[ $@ ]]
    then
        docker exec -it $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1) bash -c "$@"
    else
        docker exec -it $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide:0.1) bash
    fi
}

enter_test(){
    if [[ $@ ]]
    then
        docker exec -it $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide-test:0.1) bash -c "$@"
    else
        docker exec -it $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide-test:0.1) bash
    fi
}

pycharm(){
    docker run -d --rm  --user=$(id -u):$(id -g) --network=host \
    -v=$HOME/pycharm-config-pyide:${HOME_DIR_ON_GUEST}/? \
    -v=$HOME/pycharm-in-docker/pycharm-community-2018.3.5:${HOME_DIR_ON_GUEST}/pycharm \
    -v=$HOME/pycharm-in-docker/jdk-12:${HOME_DIR_ON_GUEST}/jdk-12 \
    -v=$HOME/pyide:${HOME_DIR_ON_GUEST}/pyide \
    -v=$HOME/pycharm.idea:${HOME_DIR_ON_GUEST}/pyide/.idea \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -e DISPLAY=unix${DISPLAY} \
    -e JAVA_HOME=${HOME_DIR_ON_GUEST}/jdk-12 \
    registry.hub.docker.com/akayunov/pyide-test:0.1 ${HOME_DIR_ON_GUEST}/pycharm/bin/pycharm.sh

}

telnet_db(){
    docker exec -it \
        $(docker container ls -a -q --filter=STATUS=running --filter ancestor=registry.hub.docker.com/akayunov/pyide-test:0.1) \
        telnet 127.0.0.1 5555
}


#test_lint(){
#    # lint tests
#    docker run -it --rm \
#        -v ${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST}:ro \
#        --network='none' pyide-test:latest \
#        bash -c \
#            "echo 'Run pycodestyle' && pycodestyle                                      ${PROJECT_DIR_ON_GUEST}/src/pyide ${PROJECT_DIR_ON_GUEST}/test/client   ${PROJECT_DIR_ON_GUEST}/test/server/tests && \
#             echo 'Run pyflakes'    && pyflakes                                         ${PROJECT_DIR_ON_GUEST}/src/pyide ${PROJECT_DIR_ON_GUEST}/test/client   ${PROJECT_DIR_ON_GUEST}/test/server/tests && \
#             echo 'Run pylint'      && pylint --rcfile=${PROJECT_DIR_ON_GUEST}/pylintrc ${PROJECT_DIR_ON_GUEST}/src/pyide ${PROJECT_DIR_ON_GUEST}/test/client/* ${PROJECT_DIR_ON_GUEST}/test/server/tests/*  \
#            "
#}





#check_stack(){
#    if [[ $(docker service ps  PYIDE_pyide --format {{.CurrentState}}) == Running* ]]
#    then
#        echo 'Sighuping container...'
#        docker kill -s SIGHUP $(docker ps -a  --filter label=name=pyide --format={{.ID}})
#
#    else
#        reinit
#    fi
#
#    local n=0
#    while  [ "$n" -lt 15 ] && [[ ! $(docker service ps  PYIDE_pyide --format {{.CurrentState}}) == Running* ]] ; do
#        echo 'Attemp to connect to server: ' ${n}  && sleep 1
#        n=$((n+1))
#    done
#
#    if [[ ! $(docker service ps  PYIDE_pyide --format {{.CurrentState}}) == Running* ]]
#    then
#        echo 'Stack does not start, exit.'
#        docker service logs PYIDE_pyide
#        exit 255
#    fi
#}



#test_functional(){
##    check_stack
#    # functional_old test
##        --network=PYIDE_pyide \
#    docker run -it --rm \
#        -v "${PROJECT_DIR_ON_HOST}/pyide/test":${PROJECT_DIR_ON_GUEST}/test:ro \
#        -v "${PROJECT_DIR_ON_HOST}/tmp":${PROJECT_DIR_ON_GUEST}/tmp \
#        pyide-test:latest pytest -s $@ ${PROJECT_DIR_ON_GUEST}/test
#}

#test_coverage(){
#    local push_cov=$1
#    shift
#
#    check_stack
#
#    case ${push_cov} in
#    "") ;;
#    "push") ;;
#    *) echo "Run as: $0 cov
#
#Possible options:
#  push  - push coverage on coveralls.io
#  ''    - get local coverage only(see ./tmp)
#  "; exit 255;;
#    esac
#
#    # get coverage
#    docker run -it --rm \
#        -v "${PROJECT_DIR_ON_HOST}":${PROJECT_DIR_ON_GUEST} \
#        --add-host="pyide:127.0.0.1" \
#        --network='none' \
#        -e PROJECT_DIR_ON_GUEST=${PROJECT_DIR_ON_GUEST} \
#        -e COVERAGE_PROCESS_START="${PROJECT_DIR_ON_GUEST}/.coveragerc" \
#        -e COVERAGE_FILE="${PROJECT_DIR_ON_GUEST}/tmp/.coverage" pyide-test:latest \
#        bash -c \
#            "cd ${PROJECT_DIR_ON_GUEST}/src && \
#             (python3 -c 'import coverage, signal, sys; signal.signal(signal.SIGINT, lambda x, y: sys.exit()); coverage.process_startup(); import pyide; pyide.main()' 2>/dev/null 1>/dev/null &) && \
#             pytest  --cov-config=${PROJECT_DIR_ON_GUEST}/.coveragerc --cov=${PROJECT_DIR_ON_GUEST}/src --cov=${PROJECT_DIR_ON_GUEST}/test --cov-report= ${PROJECT_DIR_ON_GUEST}/test/client && \
#             killall -2 python3 && \
#             sleep 1
#            "
#    # send report
#    local command="cd ${PROJECT_DIR_ON_GUEST}/tmp && coverage combine  && coverage report  && coverage html "
#    if [ ${push_cov} ]
#    then
#        command="${command} &&  coveralls"
#    fi
#    docker run -it --rm \
#        -v ${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST} \
#        -e COVERALLS_REPO_TOKEN="w6LHqcB4LPnEK3RfkEFY4C9F7SPFwqGFN" \
#        pyide-test:latest \
#        bash -c "${command}"
#
#}

main "$@"
