
# Install CNTK

REQUIRE Numpy, Scipy

RUN set -vx \
\
&& /tmp/yum_install.sh \
    openmpi \
\
&& if [ -d "/usr/local/cuda" ]; then \
    /usr/local/bin/pip3 -v install cntk-gpu; \
else \
    /usr/local/bin/pip3 -v install cntk; \
fi \
\
&& /usr/local/bin/python3 -c 'import cntk; print(cntk.__version__)'

