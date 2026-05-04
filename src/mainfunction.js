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
      model: "google/embeddinggemma-300m",
      inputs: userquery,
      provider: "hf-inference",
    };

    const queryVector = await client.featureExtraction(embeddingobj);

    //Vector search with embedded user query

    const results = await maindatasrccollec.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "vector",
          queryVector: queryVector,
          numCandidates: 10,
          limit: 10,
        },
      },
    ]);

    //textmodel input of vector search result and raw user query

    let textmodelconfig;

    if (history) {
      console.log(history);

      textmodelconfig = {
        model: "openai/gpt-oss-120b:fastest",
        messages: [
          {
            role: "system",
            content: `
You are a medical assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say “Sorry, I can't help you with that. I can only answer based on the information I have.”.
Use three sentences maximum and keep the answer concise.
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
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say “Sorry, I can't help you with that. I can only answer based on the information I have.”.
Use three sentences maximum and keep the answer concise.
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

    return textmodelans.choices[0].message.content;
  } catch (error) {
    return error.message + " " + "error";
  } finally {
    mongoose.disconnect();
  }
}
