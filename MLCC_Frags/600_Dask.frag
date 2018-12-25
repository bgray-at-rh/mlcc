
# Install Dask

REQUIRE Numpy, Pandas

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    "dask[complete]" \
\
&& /usr/local/bin/python3 -c 'import dask'

