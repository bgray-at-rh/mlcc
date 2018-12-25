
# Install RStudio 1.1.463

REQUIRE R, VNC

RUN set -vx \
\
&& cd /tmp \
&& wget -q "https://download1.rstudio.org/rstudio-1.1.463-x86_64.rpm" \
&& cd /tmp \
&& yum -y install --nogpgcheck rstudio*.rpm \
\
&& cd /var/cache \
&& /bin/rm -rf dnf yum

