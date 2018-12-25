
# Install Torch

RUN set -vx \
\
&& yum -y install \
    sox-plugins-freeworld \
    zeromq3-devel \
\
&& /tmp/yum_install.sh \
    fftw-devel \
    gnuplot \
    GraphicsMagick-devel \
    ImageMagick \
    lapack \
    libjpeg-turbo-devel \
    libpng-devel \
    ncurses-devel \
    qt-devel \
    qtwebkit-devel \
    readline-devel \
    sox \
    sox-devel \
\
&& export TORCH_NVCC_FLAGS="-D__CUDA_NO_HALF_OPERATORS__" \
&& cd /usr/local \
&& git clone --depth 1 "https://github.com/torch/distro.git" /usr/local/torch \
&& cd /usr/local/torch \
&& ./install.sh

