# LLM Usage Tracker Frontend

This is the React frontend for the LLM Usage Tracker project.

## Features
- User authentication (SUPERADMIN, ADMIN, USER)
- Dashboard and analytics charts
- Customer, user, and event management
- Demo credentials for quick login

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm start
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables
- `REACT_APP_API_URL`: Set this to your backend API URL (e.g. `https://llm-tracker-backend-3.onrender.com`)

## Deployment
- Deploy to Netlify for static hosting.
- Add a `public/_redirects` file for React Router support:
  ```
  /*    /index.html   200
  ```

## Demo Accounts
- SUPERADMIN: admin@llmtracker.com / password123
- Admin: john.smith@techcorp.com / password123
- User: sarah.johnson@techcorp.com / password123
- Admin: mike.davis@dataflow.com / password123
- User: lisa.wang@aiinnovations.com / password123
