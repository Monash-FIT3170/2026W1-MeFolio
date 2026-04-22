FROM node:20-slim
 
ENV HOME=/root
ENV PATH="/root/.meteor:$PATH"
ENV METEOR_ALLOW_SUPERUSER=1
 
RUN apt-get update && apt-get install -y \
    bash curl git python3 make g++ procps ca-certificates \
    && rm -rf /var/lib/apt/lists/*
 
RUN curl https://install.meteor.com/ | sh
RUN meteor --version
 
WORKDIR /app
COPY mefolio/ .
RUN meteor npm install
 
ENV PORT=3000
 
EXPOSE 3000
 
CMD ["meteor", "run", "--port", "3000"]