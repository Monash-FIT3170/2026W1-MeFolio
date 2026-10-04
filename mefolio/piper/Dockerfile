FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*
RUN python -m pip install --no-cache-dir "piper-tts[http]==1.8.0"

WORKDIR /voices
RUN python -m piper.download_voices en_US-lessac-medium

RUN useradd --system --uid 10001 --create-home piper
USER piper

CMD ["python", "-m", "piper.http_server", "-m", "en_US-lessac-medium", "--host", "0.0.0.0", "--port", "5000"]