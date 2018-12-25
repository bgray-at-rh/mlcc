
# Install up-to-date Centos 7

FROM centos:7

RUN set -vx \
\
&& yum -y -v -t install "https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm" \
\
&& yum clean all \
&& yum -y update \
\
&& cd /var/cache \
&& /bin/rm -rf dnf yum

INCLUDE OS-Utils, Python3.7, CMake

