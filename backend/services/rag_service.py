import fitz  # PyMuPDF
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from config import settings
import logging
import re
import math
import time
import json
from typing import List, Optional, Tuple, Dict, Any, Generator

# --- PRINCIPAL LOGGING ARCHITECTURE ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] [ARCHITECT] %(name)s: %(message)s', handlers=[logging.FileHandler("backend.log"), logging.StreamHandler()])
logger = logging.getLogger("Cognivault")

# --- AI HUB ENGINE (v2.3.0-ENT) ---
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Critical AI Config Failure: {e}")

model = genai.GenerativeModel("gemini-1.5-flash")

class ChunkContext:
    def __init__(self, content: str, source_title: str, chunk_id: int):
        self.content = content
        self.source_title = source_title
        self.chunk_id = chunk_id

# --- INGESTION & CHUNKING (v2.3.0) ---

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc: text += page.get_text() + "\n"
        doc.close()
    except Exception as e: logger.error(f"Ingestion Fault: {e}")
    return text

def split_text(text, chunk_size=700, overlap=150) -> List[str]:
    """Smart Enterprise Chunking: Overlapping sliding window (v2.3.0)."""
    if not text: return []
    text = re.sub(r'\s+', ' ', text)
    chunks, start, text_len = [], 0, len(text)
    while start < text_len:
        end = start + chunk_size
        if end >= text_len:
            chunks.append(text[start:].strip())
            break
        actual_end = text.rfind(' ', start, end)
        if actual_end == -1 or actual_end <= start: actual_end = end
        chunks.append(text[start:actual_end].strip())
        start = actual_end - overlap
    return [c for c in chunks if len(c) > 25]

# --- HYBRID SEARCH RAG 2.0 ---

def score_relevance(query: str, chunk_items: List[ChunkContext]) -> List[Tuple[float, ChunkContext]]:
    """Hybrid BM25-lite with Phrase Boosting (2.0x weight)."""
    if not chunk_items: return []
    q_low = query.lower()
    q_terms = list(set(re.findall(r'\w+', q_low)))
    if not q_terms: return [(0.0, c) for c in chunk_items]

    df = {term: 0 for term in q_terms}
    for chunk in chunk_items:
        c_low = chunk.content.lower()
        for term in q_terms:
            if term in c_low: df[term] += 1
    
    n_chunks, scores = len(chunk_items), []
    for chunk in chunk_items:
        c_low = chunk.content.lower()
        base_score, words = 0.0, re.findall(r'\w+', c_low)
        doc_len = len(words)
        if doc_len == 0: continue
        for term in q_terms:
            if df.get(term, 0) == 0: continue
            idf = math.log((n_chunks + 1) / (df[term] + 0.5))
            tf = c_low.count(term) / doc_len
            base_score += idf * (tf * (2.2) / (tf + 1.2))
        
        # PHRASE BOOST (REQUIRMENT 4.B: 2.0x weight)
        if q_low in c_low: base_score *= 2.0
        if base_score > 0: scores.append((base_score, chunk))
            
    scores.sort(key=lambda x: x[0], reverse=True)
    return scores

# --- RAG OPS & TOKEN ANALYTICS ---

def query_rag(query: str, chunk_items: List[ChunkContext], history: List[dict] = None) -> Tuple[str, dict]:
    stream = stream_query_rag(query, chunk_items, history)
    full_text, usage = "", {"prompt": 0, "completion": 0, "total": 0}
    for chunk in stream:
        if isinstance(chunk, dict): usage = chunk
        else: full_text += str(chunk)
    return full_text, usage

def stream_query_rag(query: str, chunk_items: List[ChunkContext], history: List[dict] = None) -> Generator[Any, None, None]:
    start_time = time.time()
    candidates = score_relevance(query, chunk_items)
    
    if not candidates:
        yield "I do not have enough information."
        return

    # Phase Strategy (v2.3.0): Top 15 narrowed to Top 7 (Requirement 4.C)
    selected = [c for s, c in candidates[:15]][:7]
    context_str = "\n\n".join([f"[Source: {ctx.source_title}, Segment: {ctx.chunk_id}]\n{ctx.content}" for ctx in selected])
    
    instruction = (
        "Instructions: Act as Cognivault Enterprise IQ. GROUND responses strictly in Context.\n"
        "STRICTNESS (REQUIRMENT 5): Answer ONLY from provided context. NO hallucination.\n"
        "CITATIONS (REQUIRMENT 5): [Source: Filename, Segment: ID].\n"
        "No info? Say: 'I do not have enough information'.\n\n"
        "Context (Max 5000 chars):\n" + context_str[:5000]
    )

    messages = [{"role": "user", "parts": [instruction]}]
    if history:
        for msg in history[-10:]: # 5-turn history (Requirement 6)
            role = "user" if msg["role"] == "user" else "model"
            messages.append({"role": role, "parts": [msg["content"]]})
    messages.append({"role": "user", "parts": [f"Query: {query}"]})

    try:
        response = model.generate_content(messages, stream=True, generation_config=genai.types.GenerationConfig(temperature=0.0))
        usage_meta = None
        for part in response:
            try:
                if hasattr(part, 'usage_metadata'): usage_meta = part.usage_metadata
                if part.text: yield part.text
            except (ValueError, AttributeError): continue
        if usage_meta:
            yield {"prompt": usage_meta.prompt_token_count, "completion": usage_meta.candidates_token_count, "total": usage_meta.total_token_count}
        logger.info(f"RAG Cycle Complete in {(time.time()-start_time)*1000:.2f}ms")
    except Exception as e:
        logger.error(f"AI Streaming Fault: {e}")
        yield f"\n[AI Security Collapse: {str(e)}]"

# --- ENTERPRISE AI UTILITIES ---

def generate_saas_summary(content: str) -> dict:
    """Requirement 8: Gemini structured JSON output with specific schema."""
    if not content: return {"overview": "No data found."}
    prompt = (
        "Enterprise Intelligence: Generate JSON from this text. Schema EXACTLY as follows:\n"
        "{\n"
        '  "overview": str,\n'
        '  "key_points": list,\n'
        '  "dates_and_events": list,\n'
        '  "critical_insights": list,\n'
        '  "risk_assessment": str,\n'
        '  "action_items": list\n'
        "}\n\n"
        "Text:\n" + content[:10000]
    )
    try:
        r = model.generate_content(prompt)
        txt = r.text.strip()
        if "```json" in txt: txt = txt.split("```json")[1].split("```")[0].strip()
        return json.loads(txt)
    except Exception as e:
        logger.error(f"Executive Summary Failure: {e}")
        return {"overview": f"Summary logic fault: {str(e)}", "key_points": [], "dates_and_events": [], "critical_insights": [], "risk_assessment": "Failure", "action_items": []}

async def background_indexer(doc_id: int, file_path: str):
    """SaaS Worker: Extract, Chunk, Index, and Auto-Tag (Requirement 9 & 12)."""
    from database import AsyncSessionLocal
    from models.document import Document
    
    logger.info(f"Worker {doc_id}: Synchronization pulse started.")
    text = extract_text_from_pdf(file_path)
    if not text: return
    
    chunks = split_text(text)
    
    try:
        # Generate 3-5 tags (Requirement 9)
        r = model.generate_content(f"Generate exactly 3 to 5 enterprise single-word tags for this content, comma separated: {text[:4000]}")
        tags = [t.strip() for t in r.text.split(",") if t.strip()]
    except: tags = ["General"]
    
    async with AsyncSessionLocal() as db:
        try:
            doc = await db.get(Document, doc_id)
            if doc:
                doc.content = text
                doc.chunks = chunks
                doc.tags = tags
                await db.commit()
                logger.info(f"Indexer Finalized: Doc {doc_id} | Tags: {tags} | Chunks: {len(chunks)}")
        except Exception as e:
            await db.rollback()
            logger.error(f"Worker Database Logic Fault {doc_id}: {e}")
        finally:
            await db.close()
