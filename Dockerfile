FROM node:20
ENV NODE_ENV=production

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --production

COPY frontend/ ./
RUN npm run production

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

EXPOSE 3000
CMD ["node", "index.js"]