
# Install Numpy

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    numpy \
\
&& /usr/local/bin/python3 -c 'import numpy'

