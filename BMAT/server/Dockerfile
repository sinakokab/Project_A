FROM python:3.6.1-alpine

WORKDIR /
ADD . /
ENV PYTHONUNBUFFERED 1

RUN pip install -r requirements.txt

CMD ["gunicorn", "--timeout", "1000", "--bind", "0.0.0.0:8000", "backend:app"]
