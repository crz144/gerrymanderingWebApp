FROM rocker:rstudio
MAINTAINER GerrymanderProject <anushri@live.unc.edu>

LABEL io.k8s.description = "Gerrymander Project" \
io.k8s.display-name="R to Node.js Server" \
io.openshift.expose-services = "8080:http"


COPY /. /opt/r/repo/

#install R
RUN apt-get -y update \
    && apt-get -y install python3 \
        python3-pip \
        r-base \
        gnupg \
        libcurl4-openssl-dev \
        libjq-dev \
        libprotobuf-dev \
        libgdal-dev \
        protobuf-compiler \
        curl \
        libv8-3.14-dev  \
    && pip3 install rpy2 \
    && curl -sL https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get -y install nodejs npm \
    && ln -s $(which nodejs) /usr/bin/node \
    && mkdir -p /opt/r/packages /opt/r/profile /opt/r/repo /opt/r/npm \
    && echo "r <- getOption('repos'); r['CRAN'] <- 'http://cran.us.r-project.org'; options(repos=r);" > /opt/r/profile/.Rprofile \
    && R_LIBS=/opt/r/packages R_PROFILE_USER=/opt/r/profile/.Rprofile Rscript -e "install.packages(c('maptools', 'ggplot2', 'RColorBrewer', 'rgdal', 'spdplyr', 'geojsonio', 'rmapshaper', 'spatstat','sp','geojson', 'dismo','rgeos', 'geosphere', 'geometry'))" \
    && chown 1001:0 /opt/r/profile /opt/r/packages \
    && chmod -R a+rwx /opt/r/

EXPOSE 8080

ENV R_LIBS=/opt/r/packages
ENV R_PROFILE_USER=/opt/r/profile/.Rprofile
ENV NPM_CONFIG_PREFIX=/opt/r/npm
USER 1001
WORKDIR /opt/r/repo/
CMD ["npm", "install"]
CMD ["npm", "start"]
