from pydantic import BaseModel

class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]
    model: str  # OpenAI model name (e.g., "gpt-3.5-turbo", "gpt-4")
