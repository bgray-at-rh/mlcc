
# Install Chainer

REQUIRE Numpy, CuPy

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    chainer \
\
&& /usr/local/bin/python3 -c 'import chainer'

