
# Install Caffe

# Caffe needs <python3.6_lib_dir>/site-packages/numpy/core/include and
# <python_include_dir> in PYTHON_INCLUDE variable in Makefile.config.
# (<python_include_dir> = /usr/include/python3.6m and
# /usr/local/include/python3.6m currently in RHEL7.5 MLCC containers)

REQUIRE OpenBLAS, Numpy, OpenCV

RUN set -vx \
\
# Fetch, build, install protobuf:
&& cd /tmp \
&& wget https://github.com/google/protobuf/releases/download/v3.2.0/protobuf-python-3.2.0.zip \
&& unzip protobuf*.zip && /bin/rm /tmp/protobuf*.zip && cd protobuf*\
&& export CXXFLAGS=-std=c++11 && ./configure --prefix=/usr/local \
&& make -j`getconf _NPROCESSORS_ONLN` install \
&& cd /tmp \
&& /bin/rm -r /tmp/protobuf* \
\
# Fetch, build, install boost:
&& git clone --recursive --branch=boost-1.69.0 https://github.com/boostorg/boost.git \
&& cd boost \
&& ./bootstrap.sh --with-python=/usr/local/bin/python3 --prefix=/usr/local \
&& ./b2 install \
&& ln -s /usr/local/lib/libboost_python*.so /usr/local/lib/libboost_python.so \
&& cd /tmp \
&& /bin/rm -r /tmp/boost* \
\
&& /tmp/yum_install.sh \
    gflags-devel \
    glog-devel \
    hdf5-devel \
    leveldb-devel \
    libjpeg-turbo-devel \
    libtiff \
    libyaml-devel \
    lmdb-devel \
    openblas-devel \
    opencv-devel \
    snappy-devel  \
\
&& ldconfig  \
\
# Fetch, build, install Caffe:
&& cd /usr/local \
&& git clone --depth 1 "https://github.com/BVLC/caffe.git" \
&& cd /usr/local/caffe \
&& /usr/local/bin/pip3 install pyyaml \
&& /usr/local/bin/pip3 install -r python/requirements.txt \
&& /usr/local/bin/pip3 install --upgrade python-dateutil \
\
&& echo -e '\
CUDA_DIR := /usr/local/cuda\n\
CUDA_ARCH := \\\n\
\t\t-gencode arch=compute_30,code=sm_30 \\\n\
\t\t-gencode arch=compute_35,code=sm_35 \\\n\
\t\t-gencode arch=compute_50,code=sm_50 \\\n\
\t\t-gencode arch=compute_52,code=sm_52 \\\n\
\t\t-gencode arch=compute_60,code=sm_60 \\\n\
\t\t-gencode arch=compute_61,code=sm_61 \n\
BLAS := open\n\
BLAS_INCLUDE := /usr/include/openblas\n\
PYTHON_LIBRARIES := boost_python37 python3.7m\n\
BUILD_DIR := build\n\
DISTRIBUTE_DIR := distribute\n\
TEST_GPUID := 0 \n\
Q := @ \n' \
> Makefile.config \
\
&& if [ -x /usr/local/bin/gcc ]; then \
    export CUSTOM_CXX="/usr/local/bin/g++"; \
else \
    export CUSTOM_CXX="/usr/bin/g++"; \
fi \
 \
&& if [ -d /usr/local/cuda ]; then \
    export USE_NCCL=1; \
    export USE_CUDNN=1; \
else \
    export CPU_ONLY=1; \
fi \
\
&& export OPENCV_VERSION=$(yum info installed opencv.x86_64 | grep Version | awk '{print $3}' | cut -c1) \
&& export PYTHON_INCLUDE="/usr/local/include/python3.7m /usr/local/lib/python3.7/site-packages/numpy/core/include" \
&& export INCLUDE_DIRS="$PYTHON_INCLUDE /usr/local/include" \
&& export LIBRARY_DIRS="/usr/local/lib/python* /usr/local/lib /usr/lib" \
\
&& cd /usr/local/caffe \
&& make all -j`getconf _NPROCESSORS_ONLN` \
&& make test -j`getconf _NPROCESSORS_ONLN` \
&& make -j`getconf _NPROCESSORS_ONLN` pycaffe \
\
&& export PYTHONPATH=/usr/local/caffe/python:$PYTHONPATH

#
# should that not be put in /root/.bashrc?
#

