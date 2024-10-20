import tiktoken
import faiss
import numpy as np
import pandas as pd

# Initialize the encoder for OpenAI models
encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")

def count_tokens(text: str) -> int:
    """
    Counts the number of tokens in the given text using the tiktoken library.
    """
    return len(encoding.encode(text))

def create_faiss_index(embeddings: np.ndarray) -> faiss.IndexFlatL2:
    """
    Creates a FAISS index for efficient similarity search.
    """
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index

def summarize_data(df: pd.DataFrame, columns: list, num_records: int = 1) -> list:
    """
    Summarizes the data by selecting the top `num_records` records and replacing NaN with None.
    """
    # Replace NaN with None for JSON serialization
    summarized_df = df[columns].head(num_records).replace({np.nan: None})
    return summarized_df.to_dict(orient="records")
