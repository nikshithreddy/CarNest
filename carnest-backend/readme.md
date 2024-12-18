# Backend Application - Local Setup

This guide helps you set up and run the Backend application locally.

## Prerequisites

Ensure you have the following installed on your system:

- Docker

## Steps to Run Locally

1. **Build the project**  
   ```bash
   docker build -t carnest-backend:latest .
   ```

2. **Run the project**
   ```
   bash
   docker run --env-file .env -p 8000:8000 carnest-backend:latest
   ```

3. **Open the Application**

The app will run at:
http://localhost:8000/api/health/