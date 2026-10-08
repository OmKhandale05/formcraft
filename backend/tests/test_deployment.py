import pytest

from backend.config import allowed_origins
from backend.serve import server_port


def test_local_defaults_and_normalized_production_origins():
    assert allowed_origins(None) == ["http://localhost:3000", "http://localhost:3001"]
    assert allowed_origins(" https://forms.example/,https://forms.example,https://preview.example ", production=True) == ["https://forms.example", "https://preview.example"]


@pytest.mark.parametrize("value", [None, "", "   ", "*", "https://*.vercel.app", "forms.example", "https://forms.example/builder", "https://forms.example?key=secret", "https://forms.example#fragment", "https://user:password@forms.example", "https://forms.example:invalid", "https://form craft.example", "http://public.example"])
def test_invalid_production_origins_fail_early(value):
    with pytest.raises(ValueError):
        allowed_origins(value, production=True)


@pytest.mark.parametrize("value", ["abc", "0", "-1", "65536", "8000.5", ""])
def test_invalid_port_is_rejected(value):
    with pytest.raises(ValueError, match="PORT must be"):
        server_port(value)


def test_hosting_port_is_supported():
    assert server_port("10000") == 10000
