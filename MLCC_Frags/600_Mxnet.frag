
# Install MXNet

RUN set -vx \
\
&& echo -e '\
set -vx \n\
if [ -d "/usr/local/cuda-10.0" ]; then \n\
    echo "mxnet-cu100" \n\
elif [ -d "/usr/local/cuda-9.2" ]; then \n\
    echo "mxnet-cu92" \n\
elif [ -d "/usr/local/cuda-9.1" ]; then \n\
    echo "mxnet-cu91" \n\
elif [ -d "/usr/local/cuda-9.0" ]; then \n\
    echo "mxnet-cu90" \n\
elif [ -d "/usr/local/cuda-8.0" ]; then \n\
    echo "mxnet-cu80" \n\
else \n\
    echo "mxnet" \n\
fi \n' \
> /tmp/select_mxnet.sh \
\
&& /usr/local/bin/pip3 -v install `sh /tmp/select_mxnet.sh` \
&& /usr/local/bin/python3 -c 'import mxnet as mx'

