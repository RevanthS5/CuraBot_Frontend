# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# Stage 3: Production
FROM node:18-alpine

WORKDIR /app

# Copy backend from backend-build stage
COPY --from=backend-build /app/backend ./

# Copy frontend build from frontend-build stage
COPY --from=frontend-build /app/frontend/dist ./public

# Install only production dependencies
RUN npm ci --only=production

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGO_URI=mongodb+srv://abhineethsrinivasa:ToCH5WzbtRcUeFvP@curabotcluster.yddrp.mongodb.net/CuraBot?retryWrites=true&w=majority
ENV JWT_SECRET=737116ec3e1b0a3bfe6c94df029ee59226631dde8d53a66246e5bcb90ed43108
ENV GROQ_API_KEY=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

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
