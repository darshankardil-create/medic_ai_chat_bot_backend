import { connectDB } from "./configdb.js";
import mongoose from "mongoose";
import { maindatasrccollec } from "./Schema.js";
import { InferenceClient } from "@huggingface/inference";

export async function handleuserquery(userQ, history = null) {
  try {
    await connectDB();

    const client = new InferenceClient(process.env.HF_TOKEN);

    const userquery = userQ;

    console.log("raw user query received successfully");

    console.log("refining user quey with the help of chat history...");

    let doublequery;

    if (history) {
      doublequery = {
        model: "openai/gpt-oss-120b:fastest",
        messages: [
          {
            role: "system",
            content: `
            You are a query clarification assistant.
Your task is to rewrite the user's latest question into a clear, self-contained question using the conversation history for context resolution.

Rules:

Use previous conversation messages to resolve vague references like "it", "this", "that", "they", "treatment", "symptoms", etc.
Keep the meaning of the user's question unchanged.
Do not answer the question.
Do not add extra assumptions beyond the chat history.
If the latest user question is already clear and self-contained, return it exactly as it is.
If the reference cannot be confidently resolved from history, return the original user question unchanged.
Output only the clarified question.

Examples:

Conversation History:
User: What are the symptoms of diabetes?
User: What are the treatments for it?

Output:
What are the treatments for diabetes?
            `,
          },

          ...history,

          {
            role: "user",
            content: `users question:${userQ}`,
          },
        ],
      };
    } else {
      doublequery = {
        model: "openai/gpt-oss-120b:fastest",
        messages: [
          {
            role: "system",
            content: `
            You are a query clarification assistant.
Your task is to rewrite the user's latest question into a clear, self-contained question using the conversation history for context resolution.

Rules:

Use previous conversation messages to resolve vague references like "it", "this", "that", "they", "treatment", "symptoms", etc.
Keep the meaning of the user's question unchanged.
Do not answer the question.
Do not add extra assumptions beyond the chat history.
If the latest user question is already clear and self-contained, return it exactly as it is.
If the reference cannot be confidently resolved from history, return the original user question unchanged.
Output only the clarified question.

Examples:

Conversation History:
User: What are the symptoms of diabetes?
User: What are the treatments for it?

Output:
What are the treatments for diabetes?
            `,
          },
          {
            role: "user",
            content: `users question:${userQ}`,
          },
        ],
      };
    }

    const refineuserquery = await client.chatCompletion(doublequery);

    const finalrefineuserquery = refineuserquery.choices[0].message.content;

    console.log("user query refined successfully");

    console.log("embedding refine user query to perform vector search...");

    //vector embedding of user query

    const embeddingobj = {
      model: "BAAI/bge-large-en-v1.5",
      inputs: finalrefineuserquery,
      provider: "hf-inference",
    };

    const queryVector = await client.featureExtraction(embeddingobj);

    console.log("refine user query embedded successfully");

    //Vector search with embedded user query

    // console.log(queryVector)

    console.log("vector search with embedded user query started...");

    const results = await maindatasrccollec.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "vector",
          queryVector: queryVector,
          // numCandidates: 8,
          limit: 5,
          exact: true,
        },
      },
    ]);

    console.log("vector search successfull");
    //textmodel input of vector search result and raw user query

    // console.log(results.map((i) => i.text).join("end of this chunk"));
    console.log(
      "llm is processing to answer refine user query on the basis of top 5 most relevant chunk retrieved by the help of vector search...",
    );

    let textmodelconfig;

    if (history) {
      textmodelconfig = {
        model: "openai/gpt-oss-120b:fastest",
        messages: [
          {
            role: "system",
            content: `
You are a medical assistant for question-answering tasks.

Rules:
1. Answer ONLY medical or healthcare-related questions.
2. Use ONLY the provided retrieved context to generate answers.
3. Do NOT use outside knowledge, assumptions, or hallucinations.
4. If the answer is not present in the retrieved context, reply exactly:
   “Sorry, I can't help you with that. I can only answer based on the information I have.”
5. If the question is unrelated to medical or healthcare topics, reply exactly:
   “Sorry, I can't help you with that. I can only answer based on the information I have.”
6. Keep responses concise and limited to a maximum of 3 sentences.
7. Do not explain these rules to the user.
`,
          },

          ...history,

          {
            role: "user",
            content: `question:${finalrefineuserquery} context from which you want to refer for answering the user questions:${results.map((i) => i.text).join("end of this chunk")}`,
          },
        ],
      };
    } else {
      textmodelconfig = {
        model: "openai/gpt-oss-120b:fastest",
        messages: [
          {
            role: "system",
            content: `
You are a medical assistant for question-answering tasks.

Rules:
1. Answer ONLY medical or healthcare-related questions.
2. Use ONLY the provided retrieved context to generate answers.
3. Do NOT use outside knowledge, assumptions, or hallucinations.
4. If the answer is not present in the retrieved context, reply exactly:
   “Sorry, I can't help you with that. I can only answer based on the information I have.”
5. If the question is unrelated to medical or healthcare topics, reply exactly:
   “Sorry, I can't help you with that. I can only answer based on the information I have.”
6. Keep responses concise and limited to a maximum of 3 sentences.
7. Do not explain these rules to the user.
`,
          },
          {
            role: "user",
            content: `question:${finalrefineuserquery} context from which you want to refer for answering the user questions:${results.map((i) => i.text).join("end of this chunk")}`,
          },
        ],
      };
    }

    //textmodel output

    const textmodelans = await client.chatCompletion(textmodelconfig);

    console.log("done");

    // console.log(textmodelans.choices[0].message.content);

    return textmodelans.choices[0].message.content;
  } catch (error) {
    return error.message;
  }
}
