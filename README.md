# MediQuery backend

## Visit Live Website : https://medicaichatbotfrontend.vercel.app
## Frontend repository: https://github.com/darshankardil-create/medic_ai_chat_bot_frontend

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

## Tech Stack

- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **AI Embeddings:** Hugging Face Inference API (`BAAI/bge-large-en-v1.5`)
- **Text Generation:** OpenAI-compatible model (`openai/gpt-oss-120b:fastest`)
- **Rate Limiting:** Upstash Redis + Upstash Ratelimit
- **Real-Time Communication:** Socket.IO
- **Environment Variables:** dotenv
- **PDF Processing:** pdf-parse-new
- **Text Splitting:** LangChain RecursiveCharacterTextSplitter

---

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