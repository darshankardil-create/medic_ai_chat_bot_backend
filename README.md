# MediQuery backend

## Visit Live Website : https://medicaichatbotfrontend.vercel.app
## Frontend repository: https://github.com/darshankardil-create/medic_ai_chat_bot_frontend

---

### This LLM currently uses the Gale Encyclopedia of Medicine as a core information source to answer medical-related queries. It's built as a plug-and-play system, allowing users to integrate any custom data source they prefer. Once the data is provided, the model is ready to serve accurate, domain-specific answers with a simple npm run seed command.

---

## Approach

When I decided to create a medical AI chatbot, I had two options.

### Option 1: Ready-Made AI APIs
The first option was to use ready-made solutions like Gemini or OpenAI APIs, which provide pre-built AI models and components that can be integrated quickly into the project. This approach is faster and allows a working prototype to be built in approximately 2 to 3 hours, especially for first-time implementation.

### Option 2: Build From Scratch (My Chosen Approach)
The second option was to build the complete system from scratch using technologies such as LangChain, Hugging Face, Ollama, vector embeddings, MongoDB, and Socket.IO.

In this approach:

- The medical PDF dataset is parsed and converted into chunks.
- Text chunks are transformed into vector embeddings using the `BAAI/bge-large-en-v1.5` model.
- Embeddings are stored in MongoDB for vector similarity search.
- User queries are converted into embeddings and matched against stored vectors.
- The most relevant chunks are retrieved as context.
- A text generation model then produces concise answers using the retrieved context.

This approach requires significantly more effort because:
- Embedding strategies must be designed manually.
- Chunking logic must be optimized.
- Vector search infrastructure must be implemented.
- Real-time communication and backend architecture must be handled manually.

However, many organizations prefer this approach because it can be up to **40% cheaper** than relying entirely on third-party APIs. The primary ongoing cost is server maintenance.

### Why I Chose This Approach

Beyond cost efficiency, building from scratch provides several advantages:

- **Data Privacy and Security**  
  Since the system is self-hosted, sensitive medical data remains within internal infrastructure rather than being sent to third-party AI providers.

- **Complete Customization**  
  Full control over model behavior allows optimization for medical terminology and healthcare-specific queries.

- **Offline Capability**  
  With Ollama and local models, the chatbot can function without constant external internet access.

- **No Rate Limiting or Token Costs**  
  Unlike third-party APIs, there are no token-based pricing constraints or strict request limits.

Therefore, I chose the second approach to build this medical AI chatbot.

---

  ## Backend Tech Stack

- **Backend Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Vector Database:** MongoDB Vector Search
- **Authentication & Security:** JWT (JSON Web Tokens), bcrypt, CORS
- **AI Embeddings model:** Hugging Face Inference API (`BAAI/bge-large-en-v1.5`)
- **natural language processing model :** OpenAI-compatible model (`openai/gpt-oss-120b:fastest`)

- **Rate Limiting:** Upstash Redis + Upstash Ratelimit
- **Socket.IO:** For Real-Time Communication
- **Environment Variables:** dotenv
- **PDF Processing:** pdf-parse-new
- **LangChain:**  RecursiveCharacterTextSplitter
- **Utility Library:** lodash

---

# Two-Step Prompting

The two-step prompting technique refines the LLM’s responses by first clarifying the user’s intent based on previous chat history. When a raw user query is received, the LLM makes a first pass to refine the query by considering earlier context. Once clarified, the query is embedded and sent into a vector search, which is crucial for retrieving the top 5 most relevant chunks. These chunks serve as the basis for the LLM to generate a final, standalone clarified question, which is then used to produce the precise answer.

**Example:**

1. User: "What are the symptoms of asthma?"

2. User: "How can it be managed long term?"

3. The LLM refines the query 

4. The LLM returns the final question: "What are effective long-term strategies to manage and prevent asthma?"

5. After clarification, the query is embedded and sent to vector search.

6. The LLM generates a precise answer on the basis of top 5 retrieved chunks via vector search technique.



## Project Architecture

1. **Seed Process**
   - Reads medical PDF file
   - Splits text into chunks (`chunkSize: 1000`, `chunkOverlap: 180`)
   - Generates embeddings
   - Stores vectors and text inside MongoDB

2. **User Query Flow**
   - User sends query through Socket.IO
   - Query converted into vector embedding
   - MongoDB vector search retrieves top relevant chunks
   - Retrieved context is passed to text model
   - Model generates concise medical response

3. **Chat Management**
   - Save chats
   - Update chat history
   - Delete chats
   - Delete account with all related chats

4. **Authentication**
   - User signup/login
   - JWT generation and verification

5. **Rate Limiting**
   - Sliding window rate limiting using Upstash
   - Configured for **100 requests per minute per IP**

---

## API Endpoints

### Authentication
- `POST /signin` → Register user
- `POST /login` → Login user
- `GET /gettokenpayload` → Validate JWT token
- `GET /getmyaccinfo/:id` → Get account info

### Chat Management
- `POST /savechats` → Save chat history
- `GET /getmyallchats/:username` → Get all chats
- `PUT /updatechathistory/:id` → Update chat
- `DELETE /deletechat/:id` → Delete single chat
- `DELETE /deleteacandchats/:id/:username` → Delete account + chats

---

## Installation

```bash
git clone <repository-url>
cd <project-folder>
npm install
```

Create `.env` file:

```env
MONGODBURL=<your-mongodb-url>
JWTSE=<your-secret-key>
HF_TOKEN=<your-huggingface-token>
PORT=3000
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

---

## Usage

Start backend:

```bash
npm run dev
```

Seed vector database (run once):

```bash
npm run seed
```

Server runs on:

```bash
http://localhost:3000
```

---

## Directory Structure

```bash
.
├── src
│   ├── configdb.js
│   ├── controller.js
│   ├── mainfunction.js
│   ├── ratelimit.js
│   ├── router.js
│   ├── Schema.js
│   └── socket.js
├── app.js
└── seed.js
```
---

 ## 🔒 Security Implementation and Authentication

In this backend, the project uses JSON Web Tokens (JWT) and bcrypt to enhance security.

* **JSON Web Token (JWT)**: After a successful login or signin, a JWT is generated using a secret key. The payload of this token includes the user’s unique ID, allowing each request to identify which user is making it. This token is required for accessing any protected routes.

* **bcrypt**: Passwords are hashed using bcrypt during signup so that no plain-text passwords are stored. During login, bcrypt compares the provided password to the stored hash, ensuring that only correct credentials allow access.

* **`/signin` (POST)**: This endpoint registers a new user by hashing the password and storing the user details in the database.

* **`/login` (POST)**: This endpoint verifies the user’s credentials using bcrypt. If successful, a JWT (including the user ID in the payload) is returned. This same endpoint is also used for account deletion after verifying the user’s identity.

* **`/gettokenpayload` (GET)**: This endpoint decodes the JWT, verifies it, and returns the payload, confirming the user’s identity based on the user ID.
---

## Deployment

### Backend Hosting
The backend server is deployed on **Render**:

https://medic-ai-chat-bot-backend-3.onrender.com

### Frontend Hosting
The frontend application is deployed on **Vercel**:

https://medicaichatbotfrontend.vercel.app

---

## Contributors

- **Darshan Sanjay Kardile** — Solo Founder & Developer
