from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import openai
import os
import logging
from dotenv import load_dotenv
import faiss
import json
from models import Message, ChatRequest
from utils import count_tokens, create_faiss_index, summarize_data
from sentence_transformers import SentenceTransformer
from typing import Dict, List, Any

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS to allow requests from the frontend
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://survey-analysis-rag-o278.vercel.app:3000",        # Your frontend origin
    "http://127.0.0.1:3000",    # Include if you access via 127.0.0.1
    "https://survey-analysis-rag.vercel.app:3000",    # Include if you deploy to Vercel
    "https://survey-analysis-rag.vercel.app",
    "https://survey-analysis-rag-o278.vercel.app"

]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Allow requests from these origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)

# Initialize OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize SentenceTransformer model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize global variables for datasets and FAISS indices
datasets: Dict[str, pd.DataFrame] = {}
embeddings: Dict[str, np.ndarray] = {}
indices: Dict[str, faiss.IndexFlatL2] = {}

# Parameters
NUM_SIMILAR_COLUMNS = 5  # Number of similar columns to retrieve
NUM_SUMMARY_RECORDS = 5  # Number of records to use for summarization

# FastAPI startup event to initialize models and indices
@app.on_event("startup")
async def startup_event():
    global datasets, embeddings, indices

    data_directory = "data"

    # Load all CSV files in the data directory
    try:
        for filename in os.listdir(data_directory):
            if filename.endswith(".csv"):
                dataset_name = filename[:-4]  # Remove .csv extension
                file_path = os.path.join(data_directory, filename)
                df = pd.read_csv(file_path, encoding="ISO-8859-1")
                datasets[dataset_name] = df

                # Create embeddings for dataset columns
                column_embeddings = embedding_model.encode(df.columns.tolist(), convert_to_tensor=False)
                embeddings[dataset_name] = column_embeddings

                # Build FAISS index
                index = create_faiss_index(np.array(column_embeddings))
                indices[dataset_name] = index

                logging.info(f"Dataset '{dataset_name}' loaded and indexed.")
    except FileNotFoundError:
        logging.error(f"Data directory '{data_directory}' not found. Ensure it contains the CSV files.")
        raise RuntimeError(f"Data directory '{data_directory}' not found.")

@app.post("/chat")
async def chat(chat_request: ChatRequest):
    try:
        # Get the last user message
        query_text = chat_request.messages[-1].content

        # Interpret the query
        query_info = await interpret_query(query_text)
        logging.info(f"Extracted query info: {query_info}")

        # If query_info is empty, ask for clarification
        if not query_info:
            assistant_reply = "I'm sorry, I didn't quite understand your question. Could you please clarify?"
            return {
                "reply": assistant_reply,
                "source_data": None
            }

        # Encode the query
        logging.info(f"Encoding query: {query_text}")
        query_embedding = embedding_model.encode([query_text], convert_to_tensor=False)[0].reshape(1, -1)

        retrieved_data = {}

        # Iterate over all datasets
        for dataset_name, df in datasets.items():
            # Retrieve similar columns
            distances, indices_list = indices[dataset_name].search(query_embedding, NUM_SIMILAR_COLUMNS)
            similar_columns = df.columns[indices_list.flatten()].tolist()

            # Summarize data
            data_summary = summarize_data(df, similar_columns, num_records=NUM_SUMMARY_RECORDS)

            retrieved_data[dataset_name] = {
                "columns": similar_columns,
                "data_summary": data_summary
            }

        # Generate AI response using the specified OpenAI model
        ai_response = await generate_openai_chat(
            chat_request.messages,
            retrieved_data,
            chat_request.model,
            max_tokens=500  # Increased max tokens for a more detailed response
        )

        # Return the assistant's reply along with the source data
        return {
            "reply": ai_response,
            "source_data": retrieved_data
        }

    except HTTPException as he:
        logging.error(f"HTTPException: {str(he)}")
        raise he
    except Exception as e:
        logging.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def interpret_query(query_text: str) -> dict:
    """
    Uses OpenAI to interpret the user's query, extracting intents and entities.
    """
    try:
        logging.info("Interpreting user query...")
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant that extracts intents and entities from user queries.\n"
                        "Provide the intents and entities in JSON format.\n"
                        "Example output: {\"intent\": \"compare\", \"entities\": [\"sustainability\", \"christmas\"]}"
                    )
                },
                {"role": "user", "content": query_text}
            ],
            max_tokens=150,
            temperature=0.0,
        )
        result = response.choices[0].message.content.strip()
        logging.info(f"Interpretation result: {result}")
        # Assuming the assistant returns a JSON string
        return json.loads(result)
    except Exception as e:
        logging.error(f"Error interpreting query: {str(e)}")
        return {}

async def analyze_sentiment(text: str) -> str:
    try:
        logging.info("Analyzing sentiment...")
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a sentiment analysis tool. Determine if the sentiment of the following text is Positive, Negative, or Neutral."
                },
                {"role": "user", "content": text}
            ],
            max_tokens=10,
            temperature=0.0,
        )
        sentiment = response.choices[0].message.content.strip()
        logging.info(f"Sentiment analysis result: {sentiment}")
        return sentiment
    except Exception as e:
        logging.error(f"Error analyzing sentiment: {str(e)}")
        return "Unknown"

async def generate_openai_chat(messages: List[Message], retrieved_data: Dict[str, Any], model_name: str, max_tokens: int = 500) -> str:
    try:
        logging.info(f"Generating chat response using OpenAI model {model_name}...")

        # Construct the system prompt
        system_prompt = (
            "You are an AI assistant that analyzes and compares survey results.\n\n"
            "Use the provided data to answer the user's questions and engage in a conversation.\n\n"
        )

        for dataset_name, data in retrieved_data.items():
            system_prompt += f"**{dataset_name.replace('_', ' ').title()} Dataset Top {NUM_SIMILAR_COLUMNS} Columns:** {', '.join(data['columns'])}\n"
            system_prompt += f"**{dataset_name.replace('_', ' ').title()} Data Sample ({NUM_SUMMARY_RECORDS} records):**\n"
            system_prompt += "\n".join([
                f"{i+1}. " + ", ".join(
                    [f"{key}: {value}" if pd.notna(value) else f"{key}: N/A" for key, value in record.items()]
                )
                for i, record in enumerate(data['data_summary'])
            ])
            system_prompt += "\n\n"

        # Build the messages to be sent to OpenAI
        openai_messages = [
            {"role": "system", "content": system_prompt}
        ] + [{"role": msg.role, "content": msg.content} for msg in messages]

        # Ensure token limits are respected
        total_tokens = sum([count_tokens(m["content"]) for m in openai_messages]) + max_tokens
        logging.info(f"Total tokens (messages + max_tokens): {total_tokens}")

        model_max_tokens = {
            "gpt-3.5-turbo": 4096,
            "gpt-3.5-turbo-16k": 16384,
            "gpt-4": 8192,
            "gpt-4-32k": 32768,
        }

        if model_name not in model_max_tokens:
            raise HTTPException(status_code=400, detail=f"Model {model_name} is not supported.")

        max_context_tokens = model_max_tokens[model_name]

        if total_tokens > max_context_tokens:
            logging.warning("Token limit exceeded. Truncating conversation history.")
            # Remove older messages until within token limit
            while total_tokens > max_context_tokens and len(openai_messages) > 2:
                # Remove the oldest user and assistant messages (after system prompt)
                openai_messages.pop(1)
                if len(openai_messages) > 1:
                    openai_messages.pop(1)
                total_tokens = sum([count_tokens(m["content"]) for m in openai_messages]) + max_tokens
                logging.info(f"Total tokens after truncation: {total_tokens}")

            if total_tokens > max_context_tokens:
                logging.error("Unable to reduce tokens below the limit.")
                raise HTTPException(
                    status_code=400,
                    detail="The conversation is too long. Please start a new conversation."
                )

        # Make the asynchronous API call
        response = await openai.ChatCompletion.acreate(
            model=model_name,
            messages=openai_messages,
            max_tokens=max_tokens,
            temperature=0.7,
        )

        # Extract the assistant's reply
        assistant_reply = response.choices[0].message.content.strip()
        logging.info("AI response generated successfully.")

        # Perform sentiment analysis on the user's last message
        user_message = messages[-1].content
        sentiment = await analyze_sentiment(user_message)

        # Include sentiment in the assistant's reply
        assistant_reply += f"\n\nSentiment of your question: {sentiment}"

        return assistant_reply

    except openai.error.RateLimitError as e:
        logging.error(f"OpenAI API rate limit error: {str(e)}")
        raise HTTPException(status_code=429, detail="OpenAI API rate limit exceeded. Please try again later.")
    except openai.error.OpenAIError as e:
        logging.error(f"OpenAI API error: {str(e)}")
        raise HTTPException(status_code=500, detail="OpenAI API error.")
    except Exception as e:
        logging.error(f"Error generating AI response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )
