
if [ $# -ne 1 ]
then
    echo "First arg should be your image name"
    exit 1
fi

set -vx

NVIDIA_DEVICES=$(\ls /dev/nvidia* | xargs -I{} echo '--device {}:{}')

podman run -i -t $NVIDIA_DEVICES  $1  /bin/bash
# podman run -i -t $NVIDIA_DEVICES --privileged  $1  /bin/bash

