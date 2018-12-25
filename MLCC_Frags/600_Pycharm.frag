
# Install PyCharm
# https://download.jetbrains.com/python/pycharm-community-2018.2.4.tar.gz

REQUIRE Numpy, Scipy, Matplotlib, VNC

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    pycharm

