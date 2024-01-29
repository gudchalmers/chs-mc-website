FROM node:20 as node-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run production

FROM composer:2 as composer-build
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev


FROM php:8.3-apache as run

COPY --from=node-build /app/public /usr/local/apache2/htdocs/public
COPY --from=composer-build /app/vendor /usr/local/apache2/htdocs/vendor
COPY app /usr/local/apache2/htdocs/app

EXPOSE 80