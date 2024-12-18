FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application code and .env file
COPY . .

# Set a default environment variable
ARG ENV_VAR
ENV ENV_VAR=$ENV_VAR
RUN echo "$ENV_VARS" > .env

# Expose the application port
EXPOSE 8000

# Set up an entrypoint script for migrations and static file collection
RUN echo '#!/bin/bash\n' \
         'python manage.py migrate --noinput\n' \
         'exec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Use the entrypoint script to handle setup before starting the server
ENTRYPOINT ["/entrypoint.sh"]

# Default command to start the Daphne server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "server.asgi:application"]
