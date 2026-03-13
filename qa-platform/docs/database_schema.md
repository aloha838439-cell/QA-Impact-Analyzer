# Database Schema

PostgreSQL 16 database: `qadb`

---

## Tables

### users
Stores user accounts for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| email | VARCHAR | UNIQUE, NOT NULL | User email address |
| username | VARCHAR | UNIQUE, NOT NULL | Display username |
| hashed_password | VARCHAR | NOT NULL | Bcrypt hashed password |
| is_active | BOOLEAN | DEFAULT TRUE | Account active flag |
| is_admin | BOOLEAN | DEFAULT FALSE | Admin privilege flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

---

### defects
Stores bug/defect records with semantic embeddings for similarity search.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| title | VARCHAR(500) | NOT NULL, INDEX | Defect title |
| description | TEXT | NOT NULL | Detailed description |
| severity | VARCHAR(50) | NOT NULL | Critical/High/Medium/Low |
| module | VARCHAR(200) | NOT NULL, INDEX | Affected software module |
| status | VARCHAR(100) | DEFAULT 'Open' | Open/In Progress/Resolved/Closed |
| reporter | VARCHAR(200) | | Reporter name |
| reporter_id | INTEGER | FK(users.id) | Optional FK to users |
| related_features | JSON | DEFAULT [] | List of related feature strings |
| embedding | JSON | NULLABLE | 384-dim float array (sentence-transformers) |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Notes:**
- `embedding` stores the output of `paraphrase-multilingual-MiniLM-L12-v2` model
- Embedding computed from: `{title}. {description} Module: {module} Features: {features}`
- Embedding dimension: 384 floats (stored as JSON array)

---

### changes
Tracks software changes submitted for impact analysis.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| description | TEXT | NOT NULL | Change description |
| module | VARCHAR(200) | NOT NULL | Primary affected module |
| change_type | VARCHAR(100) | DEFAULT 'Feature' | Feature/Bug Fix/Refactor/Config |
| author | VARCHAR(200) | | Change author name |
| user_id | INTEGER | FK(users.id) | Optional FK to users |
| affected_files | JSON | DEFAULT [] | List of affected file paths |
| jira_ticket | VARCHAR(100) | NULLABLE | Associated Jira ticket |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

---

### impact_analyses
Stores impact analysis results for historical tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| user_id | INTEGER | FK(users.id) | Performing user |
| change_id | INTEGER | FK(changes.id) | Associated change (optional) |
| query_description | TEXT | NOT NULL | The analysis query text |
| query_module | VARCHAR(200) | | Target module filter |
| impact_score | FLOAT | DEFAULT 0.0 | 0-100 impact score |
| risk_level | VARCHAR(50) | DEFAULT 'Low' | Low/Medium/High/Critical |
| affected_areas | JSON | DEFAULT [] | List of affected area strings |
| potential_side_effects | JSON | DEFAULT [] | List of side effect descriptions |
| similar_defect_ids | JSON | DEFAULT [] | IDs of similar defects found |
| similarity_scores | JSON | DEFAULT [] | Corresponding similarity scores |
| test_case_ids | JSON | DEFAULT [] | IDs of generated test cases |
| analysis_duration_ms | INTEGER | DEFAULT 0 | Processing time in ms |
| created_at | TIMESTAMP | DEFAULT NOW() | Analysis timestamp |

**Impact Score Calculation:**
```
impact_score = (avg_top3_similarity * 0.45) + (severity_score * 0.35) + (module_breadth * 0.20) * 100

Where:
  avg_top3_similarity = average cosine similarity of top-3 similar defects
  severity_score = weighted average (Critical=1.0, High=0.75, Medium=0.5, Low=0.25)
  module_breadth = min(num_affected_modules / 5, 1.0)
```

**Risk Level Thresholds:**
- Critical: score >= 75
- High: score >= 50
- Medium: score >= 25
- Low: score < 25

---

### test_cases
Stores AI-generated test case recommendations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment ID |
| analysis_id | INTEGER | FK(impact_analyses.id) | Associated analysis |
| user_id | INTEGER | FK(users.id) | Requesting user |
| title | VARCHAR(500) | NOT NULL | Test case title |
| description | TEXT | | Detailed description |
| steps | JSON | DEFAULT [] | Ordered list of test steps |
| expected_result | TEXT | | Expected test outcome |
| priority | VARCHAR(50) | DEFAULT 'Medium' | Critical/High/Medium/Low |
| test_type | VARCHAR(100) | DEFAULT 'Functional' | Functional/Integration/Regression/E2E/Performance |
| module | VARCHAR(200) | | Target module |
| tags | JSON | DEFAULT [] | List of tag strings |
| source_defect_ids | JSON | DEFAULT [] | Inspiring defect IDs |
| is_ai_generated | VARCHAR(10) | DEFAULT 'true' | AI generation flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

---

## Entity Relationships

```
users (1) ---< defects (many)
users (1) ---< impact_analyses (many)
users (1) ---< test_cases (many)
users (1) ---< changes (many)
changes (1) ---< impact_analyses (many)
impact_analyses (1) ---< test_cases (many)
```

---

## Indexes

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| users | email | UNIQUE | Email uniqueness & lookup |
| users | username | UNIQUE | Username uniqueness & lookup |
| defects | title | INDEX | Search by title |
| defects | module | INDEX | Filter by module |

---

## Notes

1. **Embedding Storage**: Embeddings are stored as JSON arrays rather than a native vector type (pgvector) for compatibility. In production, consider using pgvector for efficient similarity search at scale.

2. **Similarity Computation**: Currently computed in Python using scikit-learn's cosine_similarity. For large datasets (>100K defects), consider using FAISS or pgvector for efficient approximate nearest neighbor search.

3. **JSON Columns**: PostgreSQL stores JSON columns natively; queries on JSON fields require explicit casting.
