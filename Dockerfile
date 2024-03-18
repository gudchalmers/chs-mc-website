FROM node:20

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

WORKDIR /app/frontend
COPY frontend/ ./
RUN npm run build

WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "index.js"]