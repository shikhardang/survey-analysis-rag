import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_chat_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/chat", json={
            "messages": [{"role": "user", "content": "Hello"}],
            "model": "gpt-3.5-turbo"
        })
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
