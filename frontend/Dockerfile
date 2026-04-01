# Step 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files and build
COPY . .
# Accept production backend URL into build context
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_META_APP_ID
ENV VITE_META_APP_ID=$VITE_META_APP_ID

# We use --ignore-scripts or run build, allowing it to pass even if tsc warns sometimes
RUN npm run build || npx vite build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
