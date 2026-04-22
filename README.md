
# 🧠 Text-to-SQL Analytics Platform

## AI-Powered Natural Language to SQL Engine with Intelligent Insights

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://text-to-hpl2sv6z9-pratyusha-ds13s-projects.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render)](https://text-to-sql-36qx.onrender.com)
[![API Docs](https://img.shields.io/badge/API_Docs-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://text-to-sql-36qx.onrender.com/docs)

---

## 🎯 What Makes This Project Stand Out

This isn't just a text-to-SQL tool — it's an **intelligent data analysis assistant** that bridges the gap between business users and databases. It demonstrates **production-grade AI integration**, **full-stack engineering**, and **data science best practices**.

### 🔍 Why This Matters for Data Teams

| Problem | Solution |
|---------|----------|
| Business users don't write SQL | Natural language → SQL conversion |
| Analysts waste time on repetitive queries | Query history + dashboard widgets |
| Data insights get lost in spreadsheets | AI-generated summaries & explanations |
| Cross-team collaboration gaps | Self-serve analytics interface |

---

## ✨ Core Capabilities

### 🤖 LLM Integration
- **Groq API** with LLaMA models for low-latency SQL generation
- Prompt engineering for schema-aware query generation
- Fallback strategies for complex natural language patterns

### 🗄️ Dynamic Database Connectivity
- Secure MySQL connection handling
- Schema discovery & metadata extraction
- Parameterized query execution (SQL injection protected)

### 📊 Automated Analytics Dashboard
- Real-time revenue & user summary widgets
- Data-driven KPI visualizations
- Aggregated insights without manual ETL

### 🧠 AI-Powered Insight Generation
- Automatic pattern detection in result sets
- Natural language summaries of tabular data
- Anomaly & trend identification

### 🔍 SQL Explainability Module
- Plain-English breakdowns of generated SQL
- Educational tool for non-technical users
- Debugging aid for data engineers

### 🕘 Query History & Audit Trail
- Stores prompts, generated SQL, timestamps
- Enables query reproducibility & governance

---

## 🛠️ Technology Stack 

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 18, Vite, JavaScript, CSS Modules |
| **Backend** | FastAPI (Python 3.10+), Uvicorn |
| **Database** | MySQL (hosted on Railway) |
| **AI/LLM** | Groq API (LLaMA 3), custom prompt templates |
| **Deployment** | Vercel (FE), Render (BE), Railway (DB) |
| **API Standards** | REST, OpenAPI (Swagger), CORS-enabled |

---

## 🏗️ System Architecture

```
User Input (Natural Language)
        ↓
    React Frontend
        ↓
  FastAPI Backend
        ↓
   Groq LLM (LLaMA)
        ↓
   SQL Generation
        ↓
   MySQL Query Execution
        ↓
   ┌───────┴───────┐
   ↓               ↓
Results          AI Insights
   ↓               ↓
Dashboard        Explanation
```

---

## 📊 Sample Interaction

**User Prompt:**
> *"Show total revenue by product category for last month"*

**Generated SQL:**
```sql
SELECT p.category, SUM(o.amount) as total_revenue
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.order_date BETWEEN DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                      AND LAST_DAY(CURDATE() - INTERVAL 1 MONTH)
GROUP BY p.category
ORDER BY total_revenue DESC;
```

**AI Insight:**
> *"Category 'Electronics' generated 62% of last month's revenue, up 8% from the previous month. Consider increasing inventory for top 3 sub-categories."*

---

## 🔗 API Endpoints (RESTful Design)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/query/query` | NLP → SQL → Execute → Return results |
| `POST` | `/generate-insight` | Generate AI summary from query results |
| `POST` | `/explain-query` | Human-readable SQL explanation |
| `POST` | `/connect-db` | Dynamic database connection setup |
| `GET` | `/dashboard/summary` | KPI aggregations |
| `GET` | `/dashboard/widgets` | Dashboard component data |
| `GET` | `/history` | Past queries with metadata |

📘 **Interactive API Docs:** [https://text-to-sql-36qx.onrender.com/docs](https://text-to-sql-36qx.onrender.com/docs)

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL (or use Railway's free tier)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_key_here" > .env
echo "DATABASE_URL=mysql://user:pass@host:port/db" >> .env

uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev
```

---

## 📁 Project Structure 

```
text-to-sql-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── database.py      # DB connection & execution
│   │   ├── groq_client.py   # LLM integration
│   │   ├── routers/         # API route handlers
│   │   └── models/          # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Dashboard, Query, History
│   │   ├── services/        # API client
│   │   └── styles/
│   └── package.json
└── README.md
```

---

## 🧪 Evaluation Metrics 
| Metric | Approach |
|--------|----------|
| **SQL Accuracy** | Manual validation on 50+ natural language queries |
| **Latency** | < 3s end-to-end (LLM + DB execution) |
| **Error Handling** | Graceful fallbacks for invalid prompts |
| **Security** | Environment variables + parameterized queries |

---

## 🔮 Future Roadmap

- [ ] **User authentication** (JWT, role-based access)
- [ ] **Multi-database support** (PostgreSQL, BigQuery, Snowflake)
- [ ] **Export to CSV/Excel** with one click
- [ ] **Interactive charts** (Chart.js / Recharts integration)
- [ ] **Saved dashboards** per user/organization
- [ ] **Query optimization suggestions** (EXPLAIN analysis)
- [ ] **LLM fine-tuning** on custom schemas

---

## 📚 Key Learnings & Challenges Overcome

| Challenge | Solution |
|-----------|----------|
| LLM generating incorrect table names | Schema-aware prompting + metadata injection |
| CORS issues in production | Configured proper middleware in FastAPI |
| Long LLM latency | Switched to Groq (10x faster than OpenAI) |
| Database connection pooling | Implemented async connection handling |
| Frontend state management | React Context API for query history |

---

## 👩‍💻 Author

**Pratyusha Mukherjee**  
🎓 B.Tech CSE (Data Science)  
