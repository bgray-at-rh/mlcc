
# Install Caffe2

REQUIRE OpenBLAS, Numpy, OpenCV

RUN set -vx \
\
&& /tmp/yum_install.sh \
    automake \
    kernel-devel \
    leveldb-devel \
    libtool \
    libyaml-devel \
    lmdb-devel \
    opencv-devel \
    protobuf-devel \
    snappy-devel \
\
&& cd /tmp \
&& git clone "https://github.com/gflags/gflags.git" \
&& cd gflags \
&& mkdir build \
&& cd build \
&& cmake \
-DBUILD_SHARED_LIBS=ON \
-DCMAKE_CXX_FLAGS='-fPIC' \
-DCMAKE_INSTALL_PREFIX=/usr/local \
-DPYTHON_DEFAULT_EXECUTABLE=/usr/local/bin/python3 \
-USE_PYTHON2=OFF \
.. \
\
&& make -j`getconf _NPROCESSORS_ONLN` install \
&& cd /tmp \
&& /bin/rm -rf /tmp/gflags* \
\
&& git clone "https://github.com/google/glog" \
&& cd glog \
&& mkdir build \
&& cd build \
&& cmake \
-DBUILD_SHARED_LIBS=ON \
-DCMAKE_CXX_FLAGS='-fPIC' \
-DCMAKE_INSTALL_PREFIX=/usr/local \
-DPYTHON_DEFAULT_EXECUTABLE=/usr/local/bin/python3 \
-USE_PYTHON2=OFF \
.. \
\
&& make -j`getconf _NPROCESSORS_ONLN` install \
&& cd /tmp \
&& /bin/rm -rf /tmp/glog* \
\
&& /usr/local/bin/pip3 -v install \
    future \
    graphviz \
    hypothesis \
    protobuf \
    pydot \
    python-nvd3 \
    pyyaml \
    requests \
    six \
\
&& cd /tmp \
&& mkdir caffe2 \
&& cd caffe2 \
&& git clone --recursive "https://github.com/pytorch/pytorch.git" \
&& cd pytorch \
&& git submodule update --init \
&& mkdir build \
&& cd build \
&& export PYTORCH_PYTHON=python3 \
&& cmake \
-DBUILD_SHARED_LIBS=ON \
-DCMAKE_INSTALL_PREFIX=/usr/local \
-DUSE_CUDA=ON \
-DUSE_LEVELDB=OFF \
-USE_PYTHON2=OFF \
-DPYTHON_INCLUDE_DIR=/usr/local/include/python3.7 \
-DPYTHON_EXECUTABLE=/usr/local/bin/python3 \
-DPYTHON_LIBRARY=/usr/local/lib \
.. \
\
&& make -j`getconf _NPROCESSORS_ONLN` install \
&& cd /tmp \
&& /bin/rm -rf /tmp/caffe2* \
\
&& ldconfig \
\
&& /usr/local/bin/python3 -c 'from caffe2.python import core'

