import { connectDB } from "./configdb.js";
import mongoose from "mongoose";
import { maindatasrccollec } from "./Schema.js";
import { InferenceClient } from "@huggingface/inference";




export async function handleuserquery(userQ, history = null) {
  try {
    await connectDB();

    const client = new InferenceClient(process.env.HF_TOKEN);

    const userquery = userQ;

    //vector embedding of user query

    const embeddingobj = {
      model: "BAAI/bge-large-en-v1.5",
      inputs: userquery,
      provider: "hf-inference"
    };

    const queryVector = await client.featureExtraction(embeddingobj);

    //Vector search with embedded user query

    // console.log(queryVector)

    const results = await maindatasrccollec.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "vector",
          queryVector: queryVector,
          // numCandidates: 8,
          limit: 5,
          exact: true
        },
      },
    ]);


    //textmodel input of vector search result and raw user query

    // console.log(results.map((i) => i.text).join("end of this chunk"));


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
            content: `question:${userquery} context from which you want to refer for answering the user questions:${results.map((i) => i.text).join("end of this chunk")}`,
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
            content: `question:${userquery} context from which you want to refer for answering the user questions:${results.map((i) => i.text).join("end of this chunk")}`,
          },
        ],
      };
    }

    //textmodel output

    const textmodelans = await client.chatCompletion(textmodelconfig);

    // console.log(textmodelans.choices[0].message.content)

    return textmodelans.choices[0].message.content;
  } catch (error) {
    return error.message;
  } 
}
