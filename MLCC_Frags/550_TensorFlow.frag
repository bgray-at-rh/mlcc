
# Install Tensorflow, using bazel v0.21.0

REQUIRE Numpy

RUN set -vx \
\
# Install needed packages: \
&& /tmp/yum_install.sh \
    java-1.8.0-openjdk \
    java-1.8.0-openjdk-devel \
    java-1.8.0-openjdk-headless \
\
&& /usr/local/bin/pip3 -v install --upgrade \
    enum34 \
    h5py \
    keras_applications \
    keras_preprocessing \
    mock \
    pip \
    wheel \
\
&& if [ -x /usr/local/bin/python3 ]; then \
    export PYTHON_BIN_PATH="/usr/local/bin/python3"; \
    export PYTHON_LIB_PATH="$(echo /usr/local/lib/python*)"; \
    export PYTHON_INCLUDE_PATH="$(echo /usr/local/include/python*)"; \
else \
    export PYTHON_BIN_PATH="/usr/bin/python"; \
    PYTHON_VERSION_OUTPUT=`python --version 2>&1`; \
    export PYTHON_LIB_PATH="$(echo /usr/lib/python${PYTHON_VERSION_OUTPUT:7:3}/site-packages)"; \
    export PYTHON_INCLUDE_PATH="$(echo /usr/include/python${PYTHON_VERSION_OUTPUT:7:3}*)"; \
fi \
&& if [ -x /usr/local/bin/gcc ]; then \
    export GCC_HOST_COMPILER_PATH="/usr/local/bin/gcc"; \
else \
    export GCC_HOST_COMPILER_PATH="/usr/bin/gcc"; \
fi \
&& if [ -d /usr/local/cuda ]; then \
    export CUDA_TOOLKIT_PATH="/usr/local/cuda"; \
    export CUDNN_INSTALL_PATH="/usr/local/cuda"; \
    export NCCL_INSTALL_PATH="/usr/local"; \
    export TF_CUDA_CLANG=0; \
    export TF_CUDA_COMPUTE_CAPABILITIES="5.2,6.0,6.1,7.0"; \
    export TF_CUDA_VERSION=${CUDA_VERSION}; \
    CUDNN_BASE_NAME=`basename /usr/local/cuda/targets/x86_64-linux/lib/libcudnn.so.???*` \
    export TF_CUDNN_VERSION=${CUDNN_BASE_NAME##libcudnn.so.}; \
    NCCL_BASE_NAME=`basename /usr/local/lib/libnccl.so.???*` \
    export TF_NCCL_VERSION=${NCCL_BASE_NAME##libnccl.so.}; \
    export TF_NEED_CUDA=1; \
    export MLCC_BAZEL_BUILD_OPTIONS="--copt=-mavx2 --copt=-mfma --config=cuda --copt=-mfpmath=both"; \
else \
    export TF_NEED_CUDA=0; \
    export MLCC_BAZEL_BUILD_OPTIONS="--copt=-mavx2 --copt=-mfma"; \
fi \
&& export \
    CC_OPT_FLAGS="-march=native" \
    TF_DOWNLOAD_MKL=0 \
    TF_ENABLE_XLA=0 \
    TF_NEED_GCP=0 \
    TF_NEED_GDR=0 \
    TF_NEED_HDFS=0 \
    TF_NEED_JEMALLOC=1 \
    TF_NEED_KAFKA=0 \
    TF_NEED_MKL=0 \
    TF_NEED_MPI=0 \
    TF_NEED_OPENCL=0 \
    TF_NEED_OPENCL_SYCL=0 \
    TF_NEED_S3=0 \
    TF_NEED_TENSORRT=0 \
    TF_NEED_VERBS=0 \
    TF_SET_ANDROID_WORKSPACE=0 \
\
&& mkdir -p /tmp/bazel \
&& cd /tmp/bazel \
&& wget -q "https://github.com/bazelbuild/bazel/releases/download/0.21.0/bazel-0.21.0-dist.zip" \
&& unzip *.zip \
&& bash ./compile.sh \
&& mv -f /tmp/bazel/output/bazel /usr/local/bin \
&& cd /tmp \
&& /bin/rm -rf /tmp/bazel* \
\
&& git clone "https://github.com/tensorflow/tensorflow.git" \
&& cd /tmp/tensorflow \
&& git checkout master \
&& df -h \
&& bazel clean \
&& ./configure \
&& df -h \
&& bazel build \
    -c opt $MLCC_BAZEL_BUILD_OPTIONS \
    --jobs=`getconf _NPROCESSORS_ONLN` \
    --verbose_failures=1 \
    "//tensorflow/tools/pip_package:build_pip_package" \
&& df -h \
&& bazel-bin/tensorflow/tools/pip_package/build_pip_package /tmp/tensorflow/pip/tensorflow_pkg \
&& /usr/local/bin/pip3 -v install /tmp/tensorflow/pip/tensorflow_pkg/tensorflow-*_x86_64.whl \
\
&& cd /tmp \
&& /bin/rm -rf /tmp/tensorflow* \
&& /bin/rm -rf /root/.cache/bazel* /root/.bazel* \
\
&& /usr/local/bin/python3 -c 'import tensorflow as tf; print(tf.__version__)'

EXPOSE 6006

