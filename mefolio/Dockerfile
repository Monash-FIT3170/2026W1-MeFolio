FROM node:20
 
RUN apt-get update && apt-get install -y curl
 
RUN curl https://install.meteor.com/ | sh

RUN meteor --version --allow-superuser
 
WORKDIR /app
COPY . .
RUN meteor npm install --allow-superuser

ENV PORT=3000
 
EXPOSE 3000
 
CMD ["meteor", "run", "--port", "3000", "--allow-superuser"]