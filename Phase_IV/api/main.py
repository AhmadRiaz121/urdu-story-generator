from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import random
from collections import Counter
from typing import Optional
import os

app=FastAPI(title="Urdu Trigram Text Generator API", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins including Vercel deployment
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for tokenizer and model
vocab={}
merges=[]
unigram_counts=Counter()
bigram_counts=Counter()
trigram_counts=Counter()
total_unigrams=0
SOT_ID=0
EOT_ID=0


def load_tokenizer(filepath):
    # Load BPE tokenizer from JSON file. 
    with open(filepath, 'r', encoding='utf-8') as f:
        data=json.load(f)
    vocab=data['vocab']
    merges=[tuple(pair) for pair in data['merges']]
    return vocab, merges


def bpe_encode_word(word, vocab, merges):
    # Encode a single word using BPE.
    tokens=list(word)
    
    for pair in merges:
        new_tokens=[]
        i=0
        while i < len(tokens):
            if i < len(tokens) - 1 and tokens[i] == pair[0] and tokens[i + 1] == pair[1]:
                new_tokens.append(''.join(pair))
                i += 2
            else:
                new_tokens.append(tokens[i])
                i += 1
        tokens=new_tokens
    
    token_ids=[vocab.get(t, vocab.get('<UNK>', 0)) for t in tokens]
    return token_ids


def bpe_encode(text, vocab, merges):
    # Encode text using BPE tokenizer.
    space_id=vocab.get(' ', 0)
    all_ids=[]
    words=text.split()
    
    for i, word in enumerate(words):
        word_ids=bpe_encode_word(word, vocab, merges)
        all_ids.extend(word_ids)
        if i < len(words) - 1:
            all_ids.append(space_id)
    
    return all_ids


def decode_ids(token_ids, vocab):
    # Convert token IDs back to text.
    id_to_token={idx: token for token, idx in vocab.items()}
    tokens=[]
    for tid in token_ids:
        if tid == SOT_ID:
            continue
        if tid == EOT_ID:
            break
        tokens.append(id_to_token.get(tid, '<UNK>'))
    result=''.join(tokens)
    return result if result else ""


def p_unigram(w):
    # Calculate unigram probability.
    return unigram_counts[w] / total_unigrams if total_unigrams > 0 else 0


def p_bigram(w2, w1):
    # Calculate bigram probability P(w2 | w1).
    denom=unigram_counts[w1]
    if denom == 0:
        return 0
    return bigram_counts[(w1, w2)] / denom


def p_trigram(w3, w1, w2):
    # Calculate trigram probability P(w3 | w1, w2).
    denom=bigram_counts[(w1, w2)]
    if denom == 0:
        return 0
    return trigram_counts[(w1, w2, w3)] / denom


def p_interpolated(w3, w1, w2, lambda1=0.1, lambda2=0.3, lambda3=0.6):
    """
    Interpolated probability:
    P(w3 | w1, w2) = lambda1 * P_unigram(w3) + lambda2 * P_bigram(w3|w2) + lambda3 * P_trigram(w3|w1,w2)
    """
    return (lambda1 * p_unigram(w3) + lambda2 * p_bigram(w3, w2) + lambda3 * p_trigram(w3, w1, w2))


def generate_text(seed_text=None, max_tokens=300, temperature=1.0):
    # Generate text using the trigram model.
    if seed_text:
        generated=[SOT_ID] + bpe_encode(seed_text, vocab, merges)
    else:
        generated=[SOT_ID]
    
    # If we only have SOT, pick a likely second token first
    if len(generated) == 1:
        candidates={}
        for (w1, w2), count in bigram_counts.items():
            if w1 == SOT_ID:
                candidates[w2]=count
        
        if candidates:
            tokens_list=list(candidates.keys())
            weights=list(candidates.values())
            chosen=random.choices(tokens_list, weights=weights, k=1)[0]
            generated.append(chosen)
    
    for _ in range(max_tokens):
        w1=generated[-2] if len(generated) >= 2 else SOT_ID
        w2=generated[-1]
        
        # Get all possible next tokens with interpolated probabilities
        candidates={}
        
        # Collect candidates from trigrams matching (w1, w2, *)
        for (t1, t2, t3), count in trigram_counts.items():
            if t1 == w1 and t2 == w2:
                candidates[t3]=p_interpolated(t3, w1, w2)
        
        # Also add candidates from bigrams matching (w2, *)
        for (b1, b2), count in bigram_counts.items():
            if b1 == w2 and b2 not in candidates:
                candidates[b2]=p_interpolated(b2, w1, w2)
        
        if not candidates:
            break
        
        # Sample from candidates
        tokens_list=list(candidates.keys())
        weights=[max(p, 1e-10) for p in candidates.values()]
        
        # Apply temperature
        if temperature != 1.0:
            weights=[w ** (1.0 / temperature) for w in weights]
        
        total=sum(weights)
        weights=[w / total for w in weights]
        
        chosen=random.choices(tokens_list, weights=weights, k=1)[0]
        generated.append(chosen)
        
        if chosen == EOT_ID:
            break
    
    result=decode_ids(generated, vocab)
    return result.strip() if result else ""


@app.on_event("startup")
async def startup_event():
    """Load tokenizer and model on startup."""
    global vocab, merges, unigram_counts, bigram_counts, trigram_counts, total_unigrams, SOT_ID, EOT_ID
    
    print("Loading tokenizer and model...")
    
    # Determine paths (works both locally and in Docker)
    current_dir=os.path.dirname(os.path.abspath(__file__))
    
    # In Docker: /app/api/main.py, so tokenizer is at /app/BPE_Tokenizer_Training/
    # Locally: Phase_IV/api/main.py, so tokenizer is at ../../BPE_Tokenizer_Training/
    if os.path.exists('/app/BPE_Tokenizer_Training/urdu_bpe_tokenizer.json'):
        # Running in Docker
        tokenizer_path='/app/BPE_Tokenizer_Training/urdu_bpe_tokenizer.json'
    else:
        # Running locally
        base_path=os.path.dirname(os.path.dirname(current_dir))
        tokenizer_path=os.path.join(base_path, 'BPE_Tokenizer_Training', 'urdu_bpe_tokenizer.json')
    
    model_path=os.path.join(current_dir, 'model_counts.json')
    
    # Load tokenizer
    try:
        vocab, merges=load_tokenizer(tokenizer_path)
        print(f"✓ Tokenizer loaded: {len(vocab)} tokens, {len(merges)} merges")
    except FileNotFoundError:
        raise Exception(f"Tokenizer file not found at: {tokenizer_path}")
    
    # Set special token IDs
    SOT_ID=len(vocab)
    EOT_ID=SOT_ID + 1
    
    # Load model counts
    try:
        with open(model_path, 'r', encoding='utf-8') as f:
            data=json.load(f)
            unigram_counts=Counter({int(k): v for k, v in data['unigram'].items()})
            bigram_counts=Counter({tuple(map(int, k.split(','))): v for k, v in data['bigram'].items()})
            trigram_counts=Counter({tuple(map(int, k.split(','))): v for k, v in data['trigram'].items()})
            total_unigrams=sum(unigram_counts.values())
        
        print(f"✓ Model loaded: {len(unigram_counts)} unigrams, {len(bigram_counts)} bigrams, {len(trigram_counts)} trigrams")
    except FileNotFoundError:
        raise Exception(f"Model counts file not found at: {model_path}\nPlease run the training notebook first to generate this file.")
    
    print("✓ API ready to serve requests!")


# Request and Response models
class GenerateRequest(BaseModel):
    prefix: str=""
    max_length: int=300
    temperature: float=1.0

    class Config:
        json_schema_extra={
            "example": {
                "prefix": "ایک دن",
                "max_length": 100,
                "temperature": 0.8
            }
        }


class GenerateResponse(BaseModel):
    generated_text: str
    prefix: str
    max_length: int
    temperature: float


class HealthResponse(BaseModel):
    model_config={"protected_namespaces": ()}
    
    status: str
    vocab_size: int
    model_stats: dict


# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Urdu Trigram Text Generator API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /generate": "Generate text from the trigram model",
            "GET /health": "Health check with model statistics",
            "GET /docs": "Interactive API documentation"
        }
    }


@app.get("/generate")
async def generate_info():
    """
    Information about the generate endpoint.
    Use POST method to generate text.
    """
    return {
        "error": "Method Not Allowed",
        "message": "Please use POST method to generate text",
        "usage": {
            "method": "POST",
            "endpoint": "/generate",
            "body": {
                "prefix": "ایک دن (optional)",
                "max_length": 100,
                "temperature": 0.8
            }
        },
        "interactive_docs": "Visit /docs for interactive API documentation"
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """
    Generate text using the Urdu trigram language model.
    
    - **prefix**: Starting text (Urdu text). Leave empty for random generation.
    - **max_length**: Maximum number of tokens to generate (1-1000).
    - **temperature**: Sampling temperature (0.1-2.0). Higher=more random, lower=more deterministic.
    """
    try:
        # Validate input
        if request.max_length < 1 or request.max_length > 1000:
            raise HTTPException(
                status_code=400, 
                detail="max_length must be between 1 and 1000"
            )
        
        if request.temperature <= 0 or request.temperature > 2.0:
            raise HTTPException(
                status_code=400, 
                detail="temperature must be between 0.1 and 2.0"
            )
        
        # Generate text
        generated=generate_text(
            seed_text=request.prefix if request.prefix else None,
            max_tokens=request.max_length,
            temperature=request.temperature
        )
        
        return GenerateResponse(
            generated_text=generated,
            prefix=request.prefix,
            max_length=request.max_length,
            temperature=request.temperature
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint with model statistics."""
    return HealthResponse(
        status="healthy",
        vocab_size=len(vocab),
        model_stats={
            "unigrams": len(unigram_counts),
            "bigrams": len(bigram_counts),
            "trigrams": len(trigram_counts),
            "total_tokens": total_unigrams
        }
    )


@app.get("/favicon.ico")
async def favicon():
    """Return empty response for favicon requests."""
    return {"message": "No favicon available"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
