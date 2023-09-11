FROM node:18
WORKDIR /usr/bin/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9000
CMD ["node", "index.js"]
