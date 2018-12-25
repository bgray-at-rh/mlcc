
# Install Jupyter  (and also IRkernel if R is present)

RUN set -vx \
\
&& /usr/local/bin/pip3 -v install \
    jupyter \
&& if [ -x /usr/bin/R ]; then \
    /tmp/yum_install.sh \
        czmq-devel \
        libcurl-devel \
        openssl-devel \
    \
    && R -e "install.packages(c('crayon', 'pbdZMQ', 'devtools'), repos='http://cran.rstudio.com/')" \
    && R -e "devtools::install_github(paste0('IRkernel/', c('repr', 'IRdisplay', 'IRkernel')))" \
    && R -e "IRkernel::installspec(user = FALSE)"; \
fi

EXPOSE 8888

