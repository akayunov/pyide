#!/usr/bin/env bash

main() {
    local cmd=$1
    shift

    script_dir_name="`dirname \"$0\"`"              # relative

    PROJECT_DIR_ON_HOST="`( cd \"${script_dir_name}/\" && pwd )`"  # absolutized and normalized
    PROJECT_DIR_ON_GUEST='/opt/pyide'
    
    echo 'PROJECT_DIR_ON_HOST:  ' ${PROJECT_DIR_ON_HOST}
    echo 'PROJECT_DIR_ON_GUEST: ' ${PROJECT_DIR_ON_GUEST}

  case ${cmd} in
    "all") test_lint && test_functional && (test_coverage $@);;
    "func") test_functional "$@";;
    "lint") test_lint;;
    "cov") test_coverage "$@";;
    "reinit") reinit;;
    "telnet") telnet_db;;
    "log") log;;
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

telnet_db(){
    docker run -it --rm \
        --network=PYIDE_pyide \
        registry.hub.docker.com/akayunov/pyide-test:latest telnet pyide 5555
}

reinit(){
    echo 'Redeploy stack'

    #if [[ $(docker container ls -a --filter=STATUS=exited --filter=Name=PYIDE_pyide -q) ]]
    #then
#        docker container rm $(docker container ls -a --filter=STATUS=exited --filter=Name=PYIDE_pyide -q)
    #fi

    #docker stack rm PYIDE
    #while [ $(docker network ls --filter=Name=PYIDE_pyide -q) ] ; do echo 'Deleting network'; sleep 1 ; done
    #docker stack deploy -c "$PROJECT_DIR_ON_HOST/build/docker-compose.yml" PYIDE

    docker container stop  $(docker container ls | grep pyide | awk '{print $1}')

    docker run -d --rm -e PYTHONPATH=/opt/pyide/server/src -e PYTHONUNBUFFERED=true -p=31415:31415 -p=5555:5555 \
        -v /home/akayunov/pyide/server:/opt/pyide/server:ro -v /home/akayunov/pyide/client:/opt/pyide/client:ro \
        --log-driver=json-file \
        registry.hub.docker.com/akayunov/pyide:latest \
        python3 -m pyide -d
}

check_stack(){
    if [[ $(docker service ps  PYIDE_pyide --format {{.CurrentState}}) == Running* ]]
    then
        echo 'Sighuping container...'
        docker kill -s SIGHUP $(docker ps -a  --filter label=name=pyide --format={{.ID}})

    else
        reinit
    fi

    local n=0
    while  [ "$n" -lt 15 ] && [[ ! $(docker service ps  PYIDE_pyide --format {{.CurrentState}}) == Running* ]] ; do
        echo 'Attemp to connect to server: ' ${n}  && sleep 1
        n=$((n+1))
    done

    if [[ ! $(docker service ps  PYIDE_pyide --format {{.CurrentState}}) == Running* ]]
    then
        echo 'Stack does not start, exit.'
        docker service logs PYIDE_pyide
        exit 255
    fi
}

log (){
    docker service logs -f --tail=100 PYIDE_pyide
}

test_functional(){
#    check_stack
    # functional_old test
#        --network=PYIDE_pyide \
    docker run -it --rm \
        -v "${PROJECT_DIR_ON_HOST}/pyide/test":${PROJECT_DIR_ON_GUEST}/test:ro \
        -v "${PROJECT_DIR_ON_HOST}/tmp":${PROJECT_DIR_ON_GUEST}/tmp \
        registry.hub.docker.com/akayunov/pyide-test:latest pytest -s $@ ${PROJECT_DIR_ON_GUEST}/test
}

test_coverage(){
    local push_cov=$1
    shift

    check_stack

    case ${push_cov} in
    "") ;;
    "push") ;;
    *) echo "Run as: $0 cov

Possible options:
  push  - push coverage on coveralls.io
  ''    - get local coverage only(see ./tmp)
  "; exit 255;;
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
    if [ ${push_cov} ]
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
