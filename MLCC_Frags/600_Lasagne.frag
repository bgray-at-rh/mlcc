
# Install Lasagne

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install "https://github.com/Lasagne/Lasagne/archive/master.zip" \
&& /usr/local/bin/python3 -c 'import lasagne'

