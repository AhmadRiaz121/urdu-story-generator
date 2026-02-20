# Urdu Story Generator — کہانیوں کی جادوئی دنیا

A complete NLP pipeline that scrapes, trains, and serves an **Urdu trigram language model** through a playful, kid-friendly web interface.

**Live Demo:** [i232005-i230038-i232084.vercel.app](https://i232005-i230038-i232084.vercel.app)

---

## Project Overview

This project was built as an NLP course assignment and covers the **full ML pipeline**:

```
Web Scraping → Dataset Cleaning → BPE Tokenizer → Trigram Model → REST API → React Frontend
```

---

## Project Structure

```
Urdu Story Generator
├── scrapping_Phase_1/              # Web scraping & dataset
│   ├── scraping_800.ipynb          # Scraped 803 Urdu kids' stories
│   └── dataset_clean.txt           # Cleaned corpus (~8000+ lines)
│
├── BPE_Tokenizer_Training/         # Custom BPE Tokenizer
│   ├── tokenizer_training.ipynb    # Training notebook
│   └── urdu_bpe_tokenizer.json     # Trained tokenizer (250 vocab)
│
├── Trigram-Model_Phase_3/          # Language Model
│   └── trigram.ipynb               # Trigram model training
│
├── Phase_IV/                       # Backend API
│   ├── api/
│   │   ├── main.py                 # FastAPI application
│   │   └── model_counts.json       # Unigram/Bigram/Trigram counts
│   ├── Dockerfile                  # Docker container
│   ├── docker-compose.yml
│   └── requirements.txt
│
└── Phase_V/                        # React Frontend
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── LandingPage.jsx # Animated kids landing page
    │   │   │   └── TextGenerator.jsx # ChatGPT-style chat UI
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── index.css           # Full kids theme styles
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    └── README.md
```

---

## Phases Explained

### Phase 1 — Web Scraping
- Scraped **803 Urdu moral stories** for kids from [UrduPoint](https://www.urdupoint.com/kids/)
- Stories include titles like: *چالاک لومڑی*, *ایمانداری کا انعام*, *صبر کا پھل*
- Cleaned and formatted into a corpus with `<EOS>` and `<EOP>` markers

### Phase 2 — BPE Tokenizer
- Built a **Byte Pair Encoding (BPE)** tokenizer from scratch
- Vocabulary size: **250 tokens**
- Handles Urdu-specific characters: `ا`, `ب`, `پ`, `ت`, `ث`...
- Saved as `urdu_bpe_tokenizer.json` with vocab + merge rules

### Phase 3 — Trigram Language Model
- Trained an **interpolated trigram model** on the tokenized corpus
- Uses **Laplace smoothing** and **linear interpolation**:

$$P(w_3 | w_1, w_2) = \lambda_1 P(w_3) + \lambda_2 P(w_3|w_2) + \lambda_3 P(w_3|w_1,w_2)$$

- Where $\lambda_1 = 0.1$, $\lambda_2 = 0.3$, $\lambda_3 = 0.6$
- Model counts stored in `model_counts.json` (unigram, bigram, trigram)

### Phase 4 — REST API
- **FastAPI** backend with the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/`      | API info |
| `POST` | `/generate` | Generate Urdu story text |
| `GET`  | `/health` | Model health & stats |
| `GET`  | `/docs`   | Swagger UI |

- Deployed via **Docker** and hosted on **Railway**
- Live API: `https://urdu-trigram-api-production.up.railway.app`

### Phase 5 — React Frontend
- Kid-friendly UI with animated landing page
- ChatGPT-style streaming text generation
- Colorful, RTL Urdu interface with Noto Nastaliq font
- Deployed on **Vercel**

---

## Live Deployment

| Service | URL |
|---------|-----|
| Frontend (Vercel) | [i232005-i230038-i232084.vercel.app](https://i232005-i230038-i232084.vercel.app) |
| Backend API (Railway) | [urdu-trigram-api-production.up.railway.app](https://urdu-trigram-api-production.up.railway.app) |
| API Docs (Swagger) | [/docs](https://urdu-trigram-api-production.up.railway.app/docs) |
| Health Check | [/health](https://urdu-trigram-api-production.up.railway.app/health) |

---

## Local Installation & Setup

### Prerequisites
- Node.js 16+
- Python 3.11+
- npm

---

### Run the Backend (Phase IV)

```powershell
# Install dependencies
cd Phase_IV
pip install -r requirements.txt

# Start the API server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Or with Docker:
```powershell
cd Phase_IV
docker-compose up --build
```

Visit: `http://localhost:8000/docs` for interactive API docs.

---

### Run the Frontend (Phase V)

```powershell
cd Phase_V/frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

### Run Both Together

**Terminal 1 — Backend:**
```powershell
cd Phase_IV
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```powershell
cd Phase_V/frontend
npm run dev
```

---

## How to Use

1. Open [i232005-i230038-i232084.vercel.app](https://i232005-i230038-i232084.vercel.app)
2. You will see the **animated landing page** with sky and nature animations
3. Click **"کہانی بنانا شروع کریں!"** to enter the chat
4. Either type an Urdu starting phrase or pick one of the example prompts:
   - `ایک دن جنگل میں`
   - `ایک چھوٹا خرگوش`
   - `ایک شہزادی`
   - `چالاک لومڑی`
5. Press **Enter** or click the send button
6. Watch your Urdu story stream in word-by-word!

### Settings
| Parameter | Range | Description |
|-----------|-------|-------------|
| کہانی کی لمبائی (Length) | 50–500 | Number of tokens to generate |
| تخلیقی پن (Temperature) | 0.1–2.0 | Lower = predictable, Higher = creative |

---

## API Usage Example

```bash
curl -X POST "https://urdu-trigram-api-production.up.railway.app/generate" \
     -H "Content-Type: application/json" \
     -d '{
       "prefix": "ایک دن جنگل میں",
       "max_length": 200,
       "temperature": 0.8
     }'
```

**Response:**
```json
{
  "generated_text": "ایک دن جنگل میں ایک چھوٹا خرگوش رہتا تھا...",
  "prefix": "ایک دن جنگل میں",
  "max_length": 200,
  "temperature": 0.8
}
```

---

## Docker

```powershell
# Build and run with Docker Compose
cd Phase_IV
docker-compose up --build

# Or build manually
docker build -t urdu-trigram-api .
docker run -p 8000:8000 urdu-trigram-api
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Scraping | Python, BeautifulSoup |
| Tokenizer | Custom BPE (from scratch) |
| Language Model | Trigram with Interpolation |
| Backend | FastAPI, Uvicorn |
| Containerization | Docker, Docker Compose |
| Backend Hosting | Railway |
| Frontend | React 18, Vite |
| Frontend Hosting | Vercel |
| HTTP Client | Axios |
| Font | Noto Nastaliq Urdu |
| Styling | CSS3 (custom animations) |

---

## Model Details

| Metric | Value |
|--------|-------|
| Training corpus | 803 Urdu stories |
| BPE Vocabulary size | 250 tokens |
| BPE Merge rules | 240+ |
| Interpolation weights | λ₁=0.1, λ₂=0.3, λ₃=0.6 |
| Special tokens | `<SOT>`, `<EOT>`, `<EOS>`, `<EOP>` |

---

## Troubleshooting

**Cannot connect to API:**
```powershell
# Check if backend is running
curl http://localhost:8000/health
```

**Urdu font not loading:**
- Requires internet connection for Google Fonts
- Font: *Noto Nastaliq Urdu*

**Port conflict:**
```js
// vite.config.js — change the port
server: { port: 3001 }
```

---

## Team

| Roll Number                    | 
|--------------------------------|
| i232005 Muhammad Ahmed Riaz    |
| i230038 Ali Muhammad           |
| i232084 Muhammad Saad          |

---

## Note

> *یہ منصوبہ NLP کورس کے لیے بنایا گیا ہے۔ اس میں اردو کہانیوں کا ڈیٹا سیٹ، BPE ٹوکنائزر، ٹرائی گرام ماڈل، API اور بچوں کے لیے خوبصورت UI شامل ہے۔*

---

## License

This project was developed for academic purposes as part of an NLP course assignment.
