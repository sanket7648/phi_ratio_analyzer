# 1. Base Image
FROM python:3.11-slim

# 2. Set Working Directory
WORKDIR /app

# 3. Install System Dependencies
# We reverted to the standard dependencies needed for compilation.
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

ENV CMAKE_BUILD_PARALLEL_LEVEL=1

# 4. Copy requirements file
COPY requirements.txt .

# 5. Install Python Dependencies
# This will now take longer (5-10 mins) but it WON'T crash.
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy all your application code
COPY . .

# 7. Set Environment Variables for Render
ENV APP_HOST=0.0.0.0
ENV APP_PORT=8000

# 8. Expose the port
EXPOSE 8000

# 9. Run the Application
CMD uvicorn app:app --host 0.0.0.0 --port $PORT
