import requests
from typing import List, Dict, Any, Tuple
from app.config import settings

def generate_ai_answer(
    question: str,
    retrieved_chunks: List[Dict[str, Any]],
    manual_faqs: List[Dict[str, str]],
    bot_config: Dict[str, Any]
) -> Tuple[str, bool, List[Dict[str, Any]]]:
    """
    Synthesize an accurate answer using manual FAQs and retrieved document chunks.
    Returns: (answer_string, is_unanswered_flag, sources_list)
    """
    fallback_text = bot_config.get("fallback_message") or "I am not sure about that. Would you like to leave your details for human support?"
    
    # 1. Check for Direct Manual FAQ match
    q_lower = question.strip().lower()
    for faq in manual_faqs:
        faq_q = faq.get("question", "").strip().lower()
        if faq_q in q_lower or q_lower in faq_q:
            return faq.get("answer"), False, [{"type": "Manual FAQ", "name": faq.get("category", "General")}]
    
    # 2. Extract grounded context from RAG retrieved document chunks
    sources = []
    context_passages = []
    for match in retrieved_chunks:
        chunk = match.get("chunk", {})
        text = chunk.get("text", "")
        doc_name = match.get("doc_name", "Document")
        page_num = chunk.get("page", 1)
        
        context_passages.append(text)
        sources.append({
            "type": "Uploaded Document",
            "name": doc_name,
            "page": page_num
        })
    
    # If no relevant RAG chunks found and no manual FAQ match -> return fallback answer
    if not context_passages:
        return fallback_text, True, []
    
    context_str = "\n---\n".join(context_passages)
    
    # 3. Call LLM API (Gemini API if key provided)
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt = f"""You are a helpful business support assistant. Answer the customer's question strictly based on the provided context passages below. If the answer cannot be found in the context, respond exactly with: "{fallback_text}"
            
Context Passages:
{context_str}

Customer Question: {question}
Answer:"""
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            resp = requests.post(url, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                generated_text = data['candidates'][0]['content']['parts'][0]['text'].strip()
                if fallback_text.lower() in generated_text.lower():
                    return fallback_text, True, []
                return generated_text, False, sources
        except Exception as e:
            print(f"Gemini API Error: {e}")
    
    # Fallback to local grounded context synthesis if LLM API is unavailable
    combined_answer = " ".join(context_passages[:2])
    if len(combined_answer) > 20:
        return f"Based on our knowledge base: {combined_answer}", False, sources
    
    return fallback_text, True, []
