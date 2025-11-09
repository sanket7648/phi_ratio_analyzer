# 1. Base Image
FROM python:3.11-slim

# 2. Set Working Directory
WORKDIR /app

# 3. Install System Dependencies (includes GTK + GLib + OpenCV deps)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    libgtk2.0-dev \
    libgthread-2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Environment for CMake builds
ENV CMAKE_BUILD_PARALLEL_LEVEL=1

# 5. Copy requirements file
COPY requirements.txt .

# 6. Install Python Dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 7. Copy all your application code
COPY . .

# 8. Environment Variables for Render/Deployment
ENV APP_HOST=0.0.0.0
ENV APP_PORT=8000

# 9. Expose port
EXPOSE 8000

# 10. Run the Application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
