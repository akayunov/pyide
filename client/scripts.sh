#!/usr/bin/env bash

script_dir_name="`dirname \"$0\"`"              # relative
PROJECT_DIR_ON_HOST="`( cd \"${script_dir_name}/\" && dirname $(pwd) )`"  # absolute and normalized
PROJECT_DIR_ON_GUEST='/home/pyide/pyide'
HOME_DIR_ON_GUEST='/home/pyide'

echo 'PROJECT_DIR_ON_HOST:  ' ${PROJECT_DIR_ON_HOST}
echo 'PROJECT_DIR_ON_GUEST: ' ${PROJECT_DIR_ON_GUEST}

main() {
    local cmd=$1
    shift

  case ${cmd} in
    "test") tt "$@";;
    "enter") enter "$@";;
    "run") run "$@";;
    "webstorm") webstorm ;;
    *) echo "Run as: $0 command

Possible commands:
  test    - run all tests
  enter   - enter to client container
  run     - run bash in container
  webstorm - run webstorm
  "; exit 255;;
  esac
}

tt(){
    mocha "$@" test/functional/*
}

enter(){
    if [[ $@ ]]
    then
        docker exec -it $(docker ps -a -q  --filter ancestor=registry.hub.docker.com/akayunov/pyide-client-test:0.1) bash -c "$@"
    else
        docker exec -it $(docker ps -a -q  --filter ancestor=registry.hub.docker.com/akayunov/pyide-client-test:0.1) bash
    fi
}

run(){
    if [[ $@ ]]
    then
        docker run -it --rm --user=$(id -u):$(id -g) --network=host \
            -v=${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST} \
            -v=$HOME/.npm:${HOME_DIR_ON_GUEST}/.npm \
            registry.hub.docker.com/akayunov/pyide-client-test:0.1 bash -c "$@"
    else
        docker run -it --rm --user=$(id -u):$(id -g) --network=host \
            -v=${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST} \
            -v=$HOME/.npm:${HOME_DIR_ON_GUEST}/.npm \
            registry.hub.docker.com/akayunov/pyide-client-test:0.1 bash -c "$@"
    fi
}

webstorm(){
    docker run -d --rm --user=$(id -u):$(id -g) --network=host \
    -v=$HOME/pycharm-in-docker/WebStorm-191.6183.63:${HOME_DIR_ON_GUEST}/webstorm \
    -v=$HOME/webstorm-config-pyide:${HOME_DIR_ON_GUEST}/? \
    -v=${PROJECT_DIR_ON_HOST}:${PROJECT_DIR_ON_GUEST} \
    -v=$HOME/.npm:${HOME_DIR_ON_GUEST}/.npm \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -e DISPLAY=unix${DISPLAY} \
    -e JAVA_HOME=${HOME_DIR_ON_GUEST}/pycharm-in-docker/jdk-12 \
    registry.hub.docker.com/akayunov/pyide-client-test:0.1 ${HOME_DIR_ON_GUEST}/webstorm/bin/webstorm.sh
}

main "$@"
