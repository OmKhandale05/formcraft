"""Start the API using the hosting provider's port."""

import os

import uvicorn


def server_port(value):
    try:
        port = int(value)
    except ValueError as error:
        raise ValueError("PORT must be an integer between 1 and 65535") from error
    if not 1 <= port <= 65535:
        raise ValueError("PORT must be an integer between 1 and 65535")
    return port


def main():
    uvicorn.run("backend.app:app", host=os.getenv("FORMCRAFT_HOST", "0.0.0.0"), port=server_port(os.getenv("PORT", "8000")))


if __name__ == "__main__":
    main()
