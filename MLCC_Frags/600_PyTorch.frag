
# Install PyTorch 1.0.0

RUN set -vx \
\
&& echo -e '\
set -vx \n\
PYTORCH_VERSION="torch-1.0.0" \n\
if [ -d "/usr/local/cuda-10.1" ]; then \n\
    CUDA_VER="cu101" \n\
elif [ -d "/usr/local/cuda-10.0" ]; then \n\
    CUDA_VER="cu100" \n\
elif [ -d "/usr/local/cuda-9.2" ]; then \n\
    CUDA_VER="cu90" \n\
elif [ -d "/usr/local/cuda-9.1" ]; then \n\
    CUDA_VER="cu90" \n\
elif [ -d "/usr/local/cuda-9.0" ]; then \n\
    CUDA_VER="cu90" \n\
elif [ -d "/usr/local/cuda-8.0" ]; then \n\
    CUDA_VER="cu80" \n\
else \n\
    CUDA_VER="cpu" \n\
fi \n\
PYTHON_VERSION_OUTPUT=`/usr/local/bin/python3 --version 2>&1` \n\
case ${PYTHON_VERSION_OUTPUT:7:3} in \n\
    3.4) PYTHON_VER_SPEC="cp34-cp34m" ;; \n\
    3.5) PYTHON_VER_SPEC="cp35-cp35m" ;; \n\
    3.6) PYTHON_VER_SPEC="cp36-cp36m" ;; \n\
    3.7) PYTHON_VER_SPEC="cp37-cp37m" ;; \n\
    *) PYTHON_VER_SPEC="UNKNOWN" ;; \n\
esac \n\
echo "https://download.pytorch.org/whl/$CUDA_VER/$PYTORCH_VERSION-$PYTHON_VER_SPEC-linux_x86_64.whl" \n' \
> /tmp/select_pytorch.sh \
\
&& /usr/local/bin/pip3 -v install \
    `sh /tmp/select_pytorch.sh` \
    torchvision \
\
&& /usr/local/bin/python3 -c 'import torch'

