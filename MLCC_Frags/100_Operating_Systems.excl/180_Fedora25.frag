
# Install up-to-date Fedora 25

FROM fedora:25

RUN set -vx \
\
&& yum clean all \
&& yum -y update \
\
&& cd /var/cache \
&& /bin/rm -rf dnf yum

INCLUDE OS-Utils, Python3.7, CMake

