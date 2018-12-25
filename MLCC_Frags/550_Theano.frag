
# Install Theano

REQUIRE Cython, Numpy, Scipy

RUN set -vx \
\
&& cd /tmp \
&& git clone --depth 1 "https://github.com/Theano/libgpuarray.git" \
&& mkdir -p /tmp/libgpuarray/build \
&& cd /tmp/libgpuarray/build \
&& cmake -DCMAKE_BUILD_TYPE=Release .. \
&& make -j`getconf _NPROCESSORS_ONLN` install \
\
&& ldconfig \
\
&& cd /tmp/libgpuarray \
&& /usr/local/bin/python3 setup.py build \
&& /usr/local/bin/python3 setup.py install \
\
&& ldconfig \
\
&& cd /tmp \
&& /bin/rm -rf /tmp/libgpuarray* \
\
&& if [ -d /usr/local/cuda ]; then \
    echo -e '\
    [global] \n\
    floatX = float32 \n\
    device = cuda0 \n\
    [nvcc] \n\
    fastmath=True \n\
    [cuda] \n\
    root=/usr/local/cuda \n' \
    > ~/.theanorc; \
else \
    echo -e '\
    [global] \n\
    floatX = float32 \n\
    device = cpu \n' \
    > ~/.theanorc; \
fi \
\
&& /usr/local/bin/pip3 -v install git+"git://github.com/Theano/Theano.git" \
&& /usr/local/bin/python3 -c 'from theano import *'

