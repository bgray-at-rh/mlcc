
# Install PyCUDA

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    pycuda \
\
&& /usr/local/bin/python3 -c 'import pycuda'

