
# Install scikit-learn

REQUIRE Numpy, Scipy

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    scikit-learn \
\
&& /usr/local/bin/python3 -c 'import sklearn'

