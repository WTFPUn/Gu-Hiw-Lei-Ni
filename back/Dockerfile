# Build stage for preparing Python environment
FROM python:3.10-alpine as py-prepare
WORKDIR /app

# Copy requirements file to container
COPY requirement /app/requirement/

# Install Python dependencies
RUN pip install -r ./requirement/requirement.txt --no-cache-dir




FROM python:3.10-alpine as py-run

# Set the working directory to /app
WORKDIR /app

# Copy the back directory contents into the container at /app
COPY back /app/

# Copy the installed Python packages from the py-prepare stage to the py-run stage
COPY --from=py-prepare /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

# Set environment variables for the container
ENV HOST "0.0.0.0"
ENV PORT 8000

# Expose port 8000 for the container
EXPOSE 8000

# Start the container with the command "python ./main.py"
CMD ["python", "./main.py"]
