# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
# Use --only=production if you don't need devDependencies
RUN npm install --only=production

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
# Fly.io will map this internal port to its external ports (80/443)
EXPOSE 3000

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "start"]