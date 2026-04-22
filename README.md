# 🧺 EasyEats — AI-Powered Food Waste Reduction App

> Zero waste, maximum flavour. EasyEats uses computer vision and AI to detect fridge ingredients and generate personalised recipes prioritising what expires soonest.

![EasyEats](https://img.shields.io/badge/AI-Claude%20Sonnet%204.6-orange) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green) ![React](https://img.shields.io/badge/Frontend-React-blue) ![AWS](https://img.shields.io/badge/Database-DynamoDB-yellow)

---

## 🌍 The Problem

The average UK household throws away **£1,000 of food per year**. People waste food because they don't know what to cook with random leftover ingredients and can't tell what's about to expire.

EasyEats solves this by combining **computer vision** and **large language models** to detect ingredients from a fridge photo and generate waste-minimising recipes in seconds.

---

## ✨ Features

- 📸 **Fridge Scanner** — upload or photograph your fridge, AI detects all ingredients
- ⚡ **Urgency Scoring** — ingredients ranked by days to expiry (urgent/soon/ok)
- 🍽️ **AI Recipe Generation** — 3 personalised recipes ranked by urgency using Claude claude-sonnet-4-6
- ✏️ **Manual Expiry Editing** — adjust detected expiry dates before scanning
- ❤️ **Save Recipes** — save favourites to your personal library
- 👤 **User Accounts** — register, login, preferences saved per user
- 📊 **Impact Tracking** — track meals made, items saved, money and CO₂ saved

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Frontend  │────▶│  FastAPI Backend  │────▶│  AWS DynamoDB   │
│  (Mobile-first)  │     │                  │     │                 │
└─────────────────┘     │  ┌────────────┐  │     │  - users        │
                        │  │ Claude API  │  │     │  - recipes      │
                        │  │ (Vision +   │  │     │  - preferences  │
                        │  │  Recipes)   │  │     └─────────────────┘
                        │  └────────────┘  │
                        └──────────────────┘
```

### AI Pipeline
1. User uploads fridge photo
2. Image sent to **Claude claude-sonnet-4-6** → returns JSON list of detected ingredients with expiry estimates
3. Ingredients sorted by urgency, flags added (URGENT / USE SOON / OK)
4. Ingredient list + preferences sent to **Claude claude-sonnet-4-6** → returns 3 ranked recipes
5. Recipes displayed with urgency reasoning, steps, and nutrition info

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Python FastAPI, Uvicorn |
| AI Model | Anthropic Claude claude-sonnet-4-6 |
| Database | AWS DynamoDB |
| Auth | bcrypt + PyJWT |
| Validation | Pydantic v2 |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11
- Node.js 18+
- AWS Account with DynamoDB access
- Anthropic API key

### Backend Setup

```bash
cd easyeats-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -c "from app.services.dynamo import create_tables; create_tables()"
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-north-1
DYNAMO_RECIPES_TABLE=easyeats-recipes
DYNAMO_PREFS_TABLE=easyeats-preferences
API_SECRET_KEY=your-secret
CORS_ORIGINS=http://localhost:3000
```

---

## 📁 Project Structure

```
EasyEats/
├── easyeats-backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment config
│   │   ├── dependencies.py      # Auth dependency
│   │   ├── routers/
│   │   │   ├── auth.py          # Register & login
│   │   │   ├── scan.py          # AI pipeline endpoint
│   │   │   ├── recipes.py       # Saved recipes CRUD
│   │   │   └── preferences.py   # User preferences
│   │   ├── services/
│   │   │   ├── claude.py        # Anthropic API calls
│   │   │   └── dynamo.py        # DynamoDB operations
│   │   └── models/
│   │       └── schemas.py       # Pydantic models
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/               # 5 app screens
    │   ├── components/          # BottomNav
    │   ├── hooks/               # useAuth, useStats
    │   ├── styles/              # Global CSS
    │   └── api.js               # Backend API calls
    └── package.json
```

---

## 🔒 Security

- Passwords hashed with **bcrypt**
- JWT tokens for session management
- API key protection on all backend endpoints
- Environment variables for all secrets — never committed to git

---

## 📈 CV Description

*"Built a full-stack AI application that uses computer vision and large language models to detect fridge ingredients from photographs and generate personalised waste-minimising recipes. Engineered a multimodal pipeline combining Claude claude-sonnet-4-6 vision and language capabilities with structured prompt engineering, deployed with a Python FastAPI backend, AWS DynamoDB, and a mobile-first React frontend. Implemented JWT authentication, urgency-scoring algorithms, and real-time impact tracking."*

---

## 📄 License

MIT License — feel free to use and adapt.
