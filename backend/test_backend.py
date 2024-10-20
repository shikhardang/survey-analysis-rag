import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Test loading the datasets
sustainability_df = pd.read_excel("data/sustainability_research_results.xlsx")
christmas_df = pd.read_excel("data/christmas_research_results.xlsx")
print("Datasets loaded successfully")

# Test initializing the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model initialized successfully")

# Test creating embeddings
sustainability_embeddings = model.encode(sustainability_df.columns.tolist())
christmas_embeddings = model.encode(christmas_df.columns.tolist())
print("Embeddings created successfully")

# Test cosine similarity
query_embedding = model.encode(["test query"])[0]
sustainability_similarities = cosine_similarity([query_embedding], sustainability_embeddings)[0]
christmas_similarities = cosine_similarity([query_embedding], christmas_embeddings)[0]
print("Cosine similarity calculated successfully")

print("All tests passed successfully")