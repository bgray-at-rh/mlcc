
if [ $# -ne 2 ]
then
    echo "First arg should be the dockerfile name"
    echo "Second arg should be your desired image name"
    exit 1
fi

set -vx

/bin/date > $1_nohup.out
nohup  podman --log-level=debug build -f $1 -t $2 .  >> $1_nohup.out 2>&1 
/bin/date >> $1_nohup.out

