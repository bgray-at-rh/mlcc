#!/bin/sh


set -vux


# Create a dated directory for this test run

TEST_DIR_NAME=Test_Results/${HOSTNAME%%\.*}.`date +"%Y%m%d%H%M%S"`
mkdir -p $TEST_DIR_NAME


# Figure out what OS is running and what kind of GPU exists

HOST_OS=`(. /etc/os-release; echo ${ID}${VERSION_ID})`
if [ -d "/usr/local/cuda" ]; then
    GPU_VERSION=`readlink /usr/local/cuda | tr -d '-'`
else
    GPU_VERSION="CPU"
fi


# Filter the list of MLCC commands, and from them create dockerfile and image
# names.  Then loop through the MLCC commands and use them to generate the
# dockerfiles.

grep -i ${1:-"."} "mlcc_commands.txt" | \
sed "s/RHEL/$HOST_OS/" | \
sed "s/GPU/$GPU_VERSION/" | \
sort -u -R \
> "$TEST_DIR_NAME/mlcc_commands.txt"

declare -i NUM_DFS=0
while read MLCC_CMD; do
    DF_NAMES[$NUM_DFS]=`echo $MLCC_CMD | awk '{ print $3 }' | tr -s '.,' '_' | tr '[:upper:]' '[:lower:]'`
    echo ./$MLCC_CMD -o "$TEST_DIR_NAME/${DF_NAMES[$NUM_DFS]}"
    ./$MLCC_CMD      -o "$TEST_DIR_NAME/${DF_NAMES[$NUM_DFS]}"
    NUM_DFS=$(( NUM_DFS + 1 ))
done < "$TEST_DIR_NAME/mlcc_commands.txt"


# Figure out which container tool is available to build the containers.  
# Prefer podman for sure, but fall back to docker if necessary.

if [ -x /usr/bin/podman ]; then
    CTOOL=podman
elif [ -x /usr/bin/docker ]; then
    CTOOL=docker
else
    echo "Can't find container tool."
    exit 1
fi


# Loop through the commands again, this time building all the containers using
# the dockerfiles created by MLCC in the previous loop above.  

cd $TEST_DIR_NAME

for (( ix = 0; ix < $NUM_DFS; ix++ )); do 
    NAME=${DF_NAMES[$ix]}
    echo "Building: $NAME"
    (
        date
        $CTOOL build -t $NAME -f $NAME .
        if [ $? -eq 0 ]; then
            STATUS="PASS"
        else
            STATUS="FAIL"
        fi
        echo $NAME "-> $STATUS" >> results.txt
        date
    ) > $NAME'.log' 2>&1
done


