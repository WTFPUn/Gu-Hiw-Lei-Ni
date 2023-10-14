# Create a new build stage named "node-deps" based on the official Node.js 18 Alpine image
FROM node:18-alpine as node-deps

# Install packages needed for node-gyp
RUN apk add --no-cache libc6-compat

# Set the working directory to /app
WORKDIR /app 

# Copy package.json, yarn.lock, package-lock.json, or pnpm-lock.yaml to the working directory
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the lockfile format detected
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Create a new build stage named "node-runner" based on the official Node.js 18 Alpine image
FROM node:18-alpine AS node-runner

# Set the working directory to /app
WORKDIR /app

# Copy node_modules from the "node-deps" build stage to the working directory
COPY --from=node-deps /app/node_modules ./node_modules

# Copy the rest of the application files to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# Set the environment variable PORT to 3000
ENV PORT 3000

# Start the application in development mode using the "npm run dev" command
CMD ["npm", "run", "dev"]