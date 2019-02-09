
# Install up-to-date RHEL 7.5

FROM registry.access.redhat.com/rhel7.5

RUN set -vx \
\
&& echo "7.5" > /etc/yum/vars/releasever \
&& yum-config-manager --enable rhel-7-server-optional-rpms \
\
&& yum -y -v -t install "https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm" \
\
&& yum clean all \
&& yum -y update \
\
&& cd /var/cache \
&& /bin/rm -rf dnf yum

INCLUDE OS-Utils, Python3.7, CMake

