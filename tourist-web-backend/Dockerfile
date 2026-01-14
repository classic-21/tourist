FROM node:20

WORKDIR /src

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Remove node_modules & package-lock.json to prevent architecture conflicts
RUN rm -rf node_modules package-lock.json && npm install

# Copy the rest of the app
COPY . .

# Build the TypeScript files
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
