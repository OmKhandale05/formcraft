"""Validate exact browser origins before accepting cross-origin requests."""

from urllib.parse import urlsplit


def allowed_origins(value, production=False):
    if production and not value:
        raise ValueError("Set FORMCRAFT_ALLOWED_ORIGINS to your frontend URL in production")
    entries = value if value is not None else "http://localhost:3000,http://localhost:3001"
    origins = []
    for entry in entries.split(","):
        origin = entry.strip().rstrip("/")
        if not origin:
            continue
        parsed = urlsplit(origin)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password or parsed.path or parsed.query or parsed.fragment:
            raise ValueError("Origins must be exact http(s) frontend URLs without paths, wildcards or credentials")
        if "*" in origin or any(character.isspace() for character in origin):
            raise ValueError("Wildcard origins and whitespace are not supported")
        try:
            parsed.port
        except ValueError as error:
            raise ValueError("Origin port is invalid") from error
        if production and parsed.scheme != "https" and parsed.hostname not in {"localhost", "127.0.0.1"}:
            raise ValueError("Public production frontend origins must use https")
        origins.append(origin)
    if not origins:
        raise ValueError("Configure at least one frontend origin")
    return list(dict.fromkeys(origins))
