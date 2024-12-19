FROM node:20-alpine
RUN apk add git
COPY . /app
WORKDIR /app
RUN git show HEAD --name-only --oneline > /app/public/commitinfo.txt
RUN npm install
RUN npm run build
CMD ["npm", "start"]