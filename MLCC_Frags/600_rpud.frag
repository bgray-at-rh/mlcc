
# Install rpud

RUN set -vx \
\
&& cd /tmp \
&& wget -q "http://www.r-tutor.com/sites/default/files/rpud/rpux_0.6.1_linux.tar.gz" \
&& tar -xf rpux*.gz \
&& R -e "install.packages('/tmp/rpux_0.6.1_linux/rpud_0.6.1.tar.gz')" \
&& /bin/rm -rf /tmp/rpu*

