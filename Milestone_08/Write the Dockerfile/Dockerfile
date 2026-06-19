# 1. Base image
FROM node:20-alpine

# 2. Working directory
WORKDIR /app

# 3. Copy dependency files first
COPY package*.json ./

# 4. Install dependencies
RUN npm ci 

# 5. Copy prisma schema
COPY prisma ./prisma/

# 6. Generate prisma client
RUN npx prisma generate

# 7. Copy source code
COPY . .

# 8. Expose port
EXPOSE 3005

# 9. Start application
CMD ["npm", "start"]