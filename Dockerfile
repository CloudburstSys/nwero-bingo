FROM node:18-alpine
WORKDIR .
COPY . /app
WORKDIR /app
RUN npm install
RUN npm install -g typescript
RUN tsc
WORKDIR /app/dist
CMD ["npm", "run", "web"]