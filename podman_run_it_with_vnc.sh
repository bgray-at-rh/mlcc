
if [ $# -ne 1 ]
then
    echo "First arg should be your image name"
    exit 1
fi

set -vx

VNC_PORT_AND_MID="-p 5901:5901 -v /etc/machine-id:/etc/machine-id:ro"
NVIDIA_DEVICES=$(\ls /dev/nvidia* | xargs -I{} echo '--device {}:{}')

podman run -i -t $VNC_PORT_AND_MID $NVIDIA_DEVICES  $1  /bin/bash
# podman run -i -t $VNC_PORT_AND_MID $NVIDIA_DEVICES --privileged  $1  /bin/bash

