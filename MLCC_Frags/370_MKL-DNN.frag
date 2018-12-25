
# Install Intel MKL-DNN

RUN set -vx \
\
&& cd /tmp \
&& git clone "https://github.com/intel/mkl-dnn.git" \
&& cd /tmp/mkl-dnn/scripts \
&& ./prepare_mkl.sh \
&& mkdir -p /tmp/mkl-dnn/build \
&& cd /tmp/mkl-dnn/build \
&& cmake .. \
&& make -j`getconf _NPROCESSORS_ONLN` install \
\
&& ldconfig

