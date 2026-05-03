import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { InferenceClient } from "@huggingface/inference";
import { connectDB } from "./src/configdb.js";
import { maindatasrccollec } from "./src/Schema.js";
import pdf from "pdf-parse-new";
import dotenv from "dotenv";
import fs from "fs";
import _ from "lodash";
import mongoose from "mongoose";

dotenv.config();

async function splitandfeedvectorindb() {
  await connectDB();

  try {
    const client = new InferenceClient(process.env.HF_TOKEN);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 170,
    });

    const data = fs.readFileSync("./src/files/Encyclopedia-of-Medicine.pdf");

    const pageNumbersforpdf = [];

    for (let a = 31; a <= 4065; a++) {
      pageNumbersforpdf.push(a);
    }

    const parsepdf = await pdf(data, {
      pageNumbers: pageNumbersforpdf,
    });

    console.log("PDF parsed");

    const chunks = await splitter.splitText(parsepdf.text); //splits into chunk
    console.log("splitting completed");

    console.log("Embbedding started...");

    console.log("Embbeding large array with chunking strategy");

    const arrayplus = [];

    const dividedarr = _.chunk(chunks, 400);

    let arrayplusStatus = true;

    for (let [ind, chunk] of dividedarr.entries()) {
      const embeddingobj = {
        model: "google/embeddinggemma-300m",
        inputs: chunk,
        provider: "hf-inference",
      };

      //60 attempts in case of fallback to maintain the flow of the data

      let attempt = 1;
      let status;

      while (attempt <= 60) {
        //break on success
        try {
          const embeddedtext = await client.featureExtraction(embeddingobj);

          arrayplus.push(...embeddedtext);

          console.log(
            `element no: ${ind + 1} embedded successfully out of total: ${dividedarr.length} at attempt No: ${attempt} with the help of chunking statigy`,
          );

          status = true;
          break;
        } catch (error) {
          status = false;
          console.error("Attempt No:", attempt, "failed");
          attempt += 1;
          console.error(error);
        }
      }

      if (attempt <= 60 && !status) {
        //break if last attemt and still not successed
        arrayplusStatus = false;
        break;
      }
    }

    if (!arrayplusStatus) {
      //                       ^^^^^
      console.log("Embedding failed after 60 attemts !!!");
      return;
    }

    console.log("Embedding successfull!");

    await maindatasrccollec.deleteMany({});

    console.log("All previous data deleted");

    //  23157

    for (let [ind, chunk] of chunks.entries()) {
      //chunks

      const savetodb = new maindatasrccollec({
        vector: arrayplus[ind],
        text: chunk,
      });

      await savetodb.save();

      console.log(ind);
    }

    console.log("Database loaded with vector and text successfully");
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.disconnect();
  }
}

splitandfeedvectorindb();
