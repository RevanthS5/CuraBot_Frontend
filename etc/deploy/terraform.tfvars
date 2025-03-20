# Google Cloud Project Configuration
project_id = "boot41"
region     = "asia-south1"

# Container Deployment Configuration
service_name    = "curabot-app"
container_image = "asia-south1-docker.pkg.dev/boot41/a3/curabot-app"
container_tag   = "latest"

# Environment Variables (Required for CuraBot)
environment_variables = {
  
  "NODE_ENV"     = "production"
  "MONGO_URI"    = "mongodb+srv://abhineethsrinivasa:ToCH5WzbtRcUeFvP@curabotcluster.yddrp.mongodb.net/CuraBot?retryWrites=true&w=majority"
  "JWT_SECRET"   = "737116ec3e1b0a3bfe6c94df029ee59226631dde8d53a66246e5bcb90ed43108"
  "GROQ_API_KEY" = "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"
}
