
# Install Julia v1.0.3

RUN set -vx \
\
&& cd /tmp \
&& wget -q "https://julialang-s3.julialang.org/bin/linux/x64/1.0/julia-1.0.3-linux-x86_64.tar.gz" \
&& tar -xf julia*.gz \
&& /bin/rm julia*.gz \
&& cd /tmp/julia* \
&& /bin/mv LICENSE.md julia_license.md \
&& /bin/cp -a . /usr/local \
&& cd /tmp \
&& /bin/rm -rf /tmp/julia* \
\
&& echo -e '\
\n\
export JULIA_DEPOT_PATH="/usr/local/julia*/local/share/julia" \n\
\n' \
>> ~/.bashrc \
\
&& export JULIA_DEPOT_PATH="/usr/local/julia*/local/share/julia" \
\
&& julia -E 'using Pkg; Pkg.add("IJulia")'

