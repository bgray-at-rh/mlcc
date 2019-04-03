
# Install CuPy

REQUIRE Numpy

RUN set -vx \
\
&& echo -e '\
set -vx \n\
if [ -d "/usr/local/cuda-10.1" ]; then  \n\
    echo "cupy-cuda101"  \n\
elif [ -d "/usr/local/cuda-10.0" ]; then  \n\
    echo "cupy-cuda100"  \n\
elif [ -d "/usr/local/cuda-9.2" ]; then  \n\
    echo "cupy-cuda92"  \n\
elif [ -d "/usr/local/cuda-9.1" ]; then  \n\
    echo "cupy-cuda91"  \n\
elif [ -d "/usr/local/cuda-9.0" ]; then  \n\
    echo "cupy-cuda90"  \n\
elif [ -d "/usr/local/cuda-8.0" ]; then  \n\
    echo "cupy-cuda80"  \n\
else  \n\
    echo "cupy"  \n\
fi  \n' \
> /tmp/select_cupy.sh \
\
&& if [ -d "/usr/local/cuda" ]; then \
    /usr/local/bin/pip3 -v install `sh /tmp/select_cupy.sh`; \
    /usr/local/bin/python3 -c 'import cupy'; \
else \
    /usr/local/bin/python3 -c 'import numpy'; \
fi

