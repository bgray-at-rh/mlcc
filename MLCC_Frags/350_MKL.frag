
# Install MKL

RUN set -vx \
\
&& echo -e '\
[intel-mkl] \n\
name=intel-mkl \n\
baseurl="https://yum.repos.intel.com/mkl" \n\
enabled=1 \n\
gpgcheck=0 \n' \
> /etc/yum.repos.d/intel-mkl.repo \
\
&& yum -y install intel-mkl-64bit-2019.1-053 \
&& cd /var/cache \
&& /bin/rm -rf dnf yum

