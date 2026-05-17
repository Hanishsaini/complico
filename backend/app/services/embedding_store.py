import faiss
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
INDEX_PATH = "./data/vector.index"
META_PATH = "./data/vector_meta.pkl"

model = SentenceTransformer(MODEL_NAME)

def embed_texts(texts: list[str]) -> np.ndarray:
    return model.encode(texts, show_progress_bar=False).astype(np.float32)

def build_index(chunks: list[str]) -> faiss.IndexFlatIP:
    embeddings = embed_texts(chunks)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    faiss.normalize_L2(embeddings)
    index.add(embeddings)
    faiss.write_index(index, INDEX_PATH)
    with open(META_PATH, "wb") as f:
        pickle.dump(chunks, f)
    return index

def load_index() -> tuple[faiss.IndexFlatIP | None, list[str]]:
    if not os.path.exists(INDEX_PATH) or not os.path.exists(META_PATH):
        return None, []
    index = faiss.read_index(INDEX_PATH)
    with open(META_PATH, "rb") as f:
        chunks = pickle.load(f)
    return index, chunks

def retrieve_top_k(query: str, k: int = 5, index: faiss.IndexFlatIP = None, chunks: list[str] = None) -> list[str]:
    if index is None or chunks is None:
        index, chunks = load_index()
        if index is None:
            return []
    query_emb = embed_texts([query])
    faiss.normalize_L2(query_emb)
    _, indices = index.search(query_emb, k)
    results = []
    for idx in indices[0]:
        if idx != -1 and idx < len(chunks):
            results.append(chunks[idx])
    return results