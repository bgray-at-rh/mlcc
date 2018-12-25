
# Install up-to-date Fedora 26

FROM fedora:26

RUN set -vx \
\
&& yum clean all \
&& yum -y update \
\
&& cd /var/cache \
&& /bin/rm -rf dnf yum

INCLUDE OS-Utils, Python3.7, CMake

