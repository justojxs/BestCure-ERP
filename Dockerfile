FROM node:18-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm install
RUN npm cache clean --force

COPY backend ./

# run as non-root
RUN addgroup -g 1001 -S appgroup && \
  adduser -S appuser -u 1001 -G appgroup
USER appuser

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

CMD ["npm", "start"]
