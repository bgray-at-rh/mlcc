
# Install Pandas

REQUIRE Numpy

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    pandas \
\
&& /usr/local/bin/python3 -c 'import pandas'

