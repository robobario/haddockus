DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
docker build $DIR/docker -t haddockus
docker run -it --rm -v $DIR:/opt/project haddockus gosu $UID:1 /opt/project/run.sh
