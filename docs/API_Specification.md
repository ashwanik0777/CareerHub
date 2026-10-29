# API Specification

## 1. Authentication APIs
### `POST /api/auth/register`
Creates a new user record.
- **Request Body:** `{ email, password, name }`
- **Response:** `{ success: true }` (Sets signed HTTP-only `session_token` cookie)

### `POST /api/auth/login`
Validates user credentials.
- **Request Body:** `{ email, password }`
- **Response:** `{ success: true }` (Sets signed HTTP-only `session_token` cookie)

---

## 2. Public Developer APIs
### `GET /api/v1/profile`
Retrieves the user's profile data.
- **Headers:** `Authorization: Bearer <ApiKey>`
- **Response:**
  ```json
  {
    "success": true,
    "name": "Jane Doe",
    "email": "user@platform.com",
    "profile": {
      "headline": "...",
      "bio": "...",
      "experiences": [],
      "skills": []
    }
  }
  ```

---

## 3. AI Copilot Services
### `POST /api/ai/optimize-resume`
Scores resume readability and returns optimization suggestions.
- **Request Body:** `{ resumeText, targetRole }`
- **Response:** `{ success: true, recommendations: [...] }`

### `POST /api/ai/analyze-ats`
Scans resume against ATS formats and checks for missing keywords.
- **Request Body:** `{ resumeText, jobDescription }`
- **Response:** `{ success: true, analysis: { overallScore, categories: [...] } }`

---

## 4. OAuth SSO Gateway
### `POST /api/oauth/register`
Registers a new developer application.
- **Request Body:** `{ name, redirectUris }`
- **Response:** `{ success: true, clientId, clientSecret }`

### `POST /api/oauth/authorize`
Creates a temporary authorization code for user-approved scopes.
- **Request Body:** `{ clientId, scopes }`
- **Response:** `{ success: true, code }`

### `POST /api/oauth/token`
Exchanges authorization code for access token.
- **Request Body:** `{ client_id, client_secret, code }`
- **Response:** `{ access_token, refresh_token, expires_in, token_type }`
