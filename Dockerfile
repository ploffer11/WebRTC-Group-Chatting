# Base 이미지 설정
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

COPY . .

RUN npm install

RUN npm run build:back

EXPOSE 3000

CMD ["npm", "run", "start:prod", "--prefix", "backend"]