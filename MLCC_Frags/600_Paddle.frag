
# Install Paddle

REQUIRE Numpy, Scipy

RUN set -vx \
\
&& /tmp/yum_install.sh \
    boost-devel \
    patchelf \
    protobuf-devel \
    swig \
\
&& /usr/local/bin/pip3 -v install \
    numpy \
    protobuf \
    wheel \
\
&& cd /tmp \
&& git clone "https://github.com/PaddlePaddle/Paddle" paddle \
&& df -h \
&& mkdir -p /tmp/paddle/build \
&& cd /tmp/paddle/build \
&& cmake \
-DCMAKE_INSTALL_PREFIX=/usr/local \
-DPYTHON_EXECUTABLE=/usr/local/bin/python3 \
-DPYTHON_INCLUDE_DIR=/usr/local/include/python3.7 \
-DPYTHON_LIBRARY=/usr/local/lib \
-DWITH_MKL=OFF \
-USE_PYTHON2=OFF \
.. \
\
&& make -j`getconf _NPROCESSORS_ONLN` install \
\
&& ldconfig \
\
&& df -h \
&& cd /tmp \
&& /bin/rm -rf /tmp/paddle \
&& ls -l /usr/local/opt \
&& cd /usr/local/opt/paddle/share/wheels/ \
&& /usr/local/bin/pip3 -v install *.whl \
&& /usr/local/bin/python3 -c 'import paddle'

