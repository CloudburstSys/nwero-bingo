FROM node:20-alpine
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN git rev-parse --short HEAD > /app/public/commitinfo.txt
CMD ["npm", "start"]