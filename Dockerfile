FROM node:18-alpine
WORKDIR .
COPY . /app
WORKDIR /app
RUN npm install
RUN npm install -g typescript ts-loader webpack sass
RUN tsc
RUN npx webpack --config webpack.config.js
RUN sass src-web/index.scss public/bundle.css
WORKDIR /app/dist
CMD ["npm", "run", "web"]