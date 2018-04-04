#!/usr/bin/env bash

script_dir_name="`dirname \"$0\"`"              # relative
PROJECT_DIR="`( cd \"${script_dir_name}/../\" && pwd )`"  # absolutized and normalized
echo ${PROJECT_DIR}

# lint tests
docker run -it --rm -v ${PROJECT_DIR}:/opt/pyide:ro registry.hub.docker.com/akayunov/pyide-test:latest bash -c \
'echo "Run pycodestyle" && pycodestyle                         "/opt/pyide/src/pyide" "/opt/pyide/test/client" "/opt/pyide/test/server/tests" || \
 echo "Run pyflakes"    && pyflakes                            "/opt/pyide/src/pyide" "/opt/pyide/test/client" "/opt/pyide/test/server/tests" || \
 echo "Run pylint"      && pylint --rcfile=/opt/pyide/pylintrc "/opt/pyide/src/pyide" "/opt/pyide/test/client" "/opt/pyide/test/server/tests"    \
'


# functional test
docker run -it --rm -v "$PROJECT_DIR"/test:/opt/pyide/test:ro -v "$PROJECT_DIR"/tmp:/opt/pyide/tmp  --network=PYIDE_pyide \
    registry.hub.docker.com/akayunov/pyide-test:latest pytest /opt/pyide/test/client