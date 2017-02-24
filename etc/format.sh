DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build $DIR/docker -f $DIR/docker/Dockerfile.format -t haddockus-format
docker run --rm -v $DIR/..:/opt/project haddockus-format gosu $UID:1 ./etc/reformat.sh

