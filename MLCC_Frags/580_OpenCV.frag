
# Install OpenCV

RUN set -vx \
\
&& /tmp/yum_install.sh \
    opencv \
    opencv-core \
    opencv-devel

