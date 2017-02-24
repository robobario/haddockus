#https://github.com/jorgebastida/glue
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build $DIR/docker -f $DIR/docker/Dockerfile.sprite -t haddockus-sprite
docker run --rm -it -v $DIR/..:/opt/project haddockus-sprite gosu $UID:1 glue /opt/project/sprites -r -f --json --no-css /opt/project/src/client/app
