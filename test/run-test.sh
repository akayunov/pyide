#!/usr/bin/env bash

docker run -it --rm -v /opt/pyide/test:/opt/pyide/test:ro -v /opt/pyide/tmp:/opt/pyide/tmp  --network=PYIDE_pyide \
    registry.hub.docker.com/akayunov/pyide-test:latest pytest /opt/pyide/test/client