# Bhagavad Gita Angular Static Web App

This project is an Angular-based static web application. Below are the details regarding the structure and setup of the application.

## Features
- View chapters and slokas from the Bhagavad Gita.
- Toggle between Sanskrit and English translations.
- Backend API powered by Azure Functions.
- Caching for improved performance.

## Project Structure

```
/src # Angular Frontend Application
/api # Azure Functions backend
/dist # Build output for the application
swa-deploy.sh # Deployment script for SWA
```
## Prerequisites
- Node.js (v16 or later)
- Azure CLI
- Azure Static Web Apps CLI (`@azure/static-web-apps-cli`)

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd bhagavad-gita
   ```

2. **Install dependencies:**
   ```
   npm install
   cd api
   npm install
   cd ..
   ```
### 4. Build the Application
Run the following command to build the frontend:
```bash
npm run build
```

3. **Run the application:**
   ```
   ./swa-deploy.sh local start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4280` to view the application.

### 5. Deploy the application
```
./swa-deploy.sh production deploy

```

## Usage

This application serves as a template for building static web applications using Angular. You can modify the components, styles, and assets as needed to fit your project requirements.

## Privacy

This application uses cookies to remember users last viewed chapter and sloka for their convenience. No personal data is stored or tracked. Cookies are used solely for improving user's experience and are not used for analytics or advertising.