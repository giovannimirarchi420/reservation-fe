#!/bin/bash
set -e

# Configuration
DOCKER_USERNAME=g420  # Change this to your Docker Hub username
IMAGE_NAME=resource-management-frontend

# Extract version from package.json
VERSION=$(grep -o '"version": "[^"]*' package.json | cut -d'"' -f4)
if [ -z "$VERSION" ]; then
  echo "Error: Could not extract version from package.json"
  exit 1
fi

echo "Extracted version $VERSION from package.json"

# Set image tags
IMAGE_TAG=$VERSION
LATEST_TAG=latest

# Log in to Docker Hub (you'll be prompted for password)
echo "Logging in to Docker Hub as $DOCKER_USERNAME"
docker login -u $DOCKER_USERNAME

# Setup buildx builder if it doesn't exist
if ! docker buildx inspect multiplatform-builder &>/dev/null; then
  echo "Creating new buildx builder"
  docker buildx create --name multiplatform-builder --use
else
  echo "Using existing buildx builder"
  docker buildx use multiplatform-builder
fi

# Make sure the builder is running
docker buildx inspect --bootstrap

# Build and push for multiple platforms in one go
echo "Building and pushing multi-architecture image for version $VERSION"
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG \
  --tag $DOCKER_USERNAME/$IMAGE_NAME:$LATEST_TAG \
  --push \
  .

echo "Done! Multi-architecture images pushed to Docker Hub:"
echo "- $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
echo "- $DOCKER_USERNAME/$IMAGE_NAME:$LATEST_TAG"
echo ""
echo "Supported architectures: AMD64, ARM64, ARMv7"