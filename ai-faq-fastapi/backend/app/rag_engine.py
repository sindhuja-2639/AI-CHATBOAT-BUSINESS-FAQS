import os
import fitz # PyMuPDF
import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def extract_text_from_pdf(filepath: str) -> List[Dict[str, Any]]:
    """Extract text page by page from PDF using PyMuPDF (fitz)"""
    chunks = []
    doc = fitz.open(filepath)
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        cleaned_text = clean_text(text)
        if cleaned_text:
            # Sub-chunk if page text is long
            paragraphs = [p.strip() for p in cleaned_text.split("\n\n") if len(p.strip()) > 20]
            if not paragraphs:
                paragraphs = [cleaned_text]
            
            for p in paragraphs:
                chunks.append({
                    "id": f"p{page_num+1}_{len(chunks)}",
                    "text": p,
                    "page": page_num + 1
                })
    doc.close()
    return chunks

def extract_text_from_txt(filepath: str) -> List[Dict[str, Any]]:
    """Extract text from plain TXT file"""
    chunks = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 20]
    if not paragraphs:
        paragraphs = [content.strip()]
    
    for idx, p in enumerate(paragraphs):
        chunks.append({
            "id": f"txt_{idx+1}",
            "text": p,
            "page": 1
        })
    return chunks

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

class RAGEngine:
    @staticmethod
    def search_similar_chunks(query: str, chunks: List[Dict[str, Any]], top_k: int = 3, min_similarity: float = 0.15) -> List[Dict[str, Any]]:
        """Perform semantic retrieval over document chunks using TF-IDF & Cosine Similarity"""
        if not chunks or not query.strip():
            return []
        
        texts = [c["text"] for c in chunks]
        
        vectorizer = TfidfVectorizer(stop_words='english')
        try:
            tfidf_matrix = vectorizer.fit_transform(texts + [query])
        except ValueError:
            return []
        
        doc_vectors = tfidf_matrix[:-1]
        query_vector = tfidf_matrix[-1]
        
        similarities = cosine_similarity(query_vector, doc_vectors)[0]
        
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= min_similarity:
                results.append({
                    "chunk": chunks[idx],
                    "score": score
                })
        return results
