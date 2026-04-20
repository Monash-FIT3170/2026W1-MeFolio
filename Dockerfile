FROM node:25

RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    python3 

# Install Meteor
RUN curl https://install.meteor.com/ | sh

WORKDIR /workspace

EXPOSE 3000

CMD ["bash"]