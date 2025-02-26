import { DataAPIClient } from "@datastax/astra-db-ts"
import { GoogleGenerativeAI } from "@google/generative-ai"
import {convertToCoreMessages, streamText,} from "ai"
import {google} from "@ai-sdk/google"
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai"
import { Experimental_LanguageModelV1Middleware as middlewarev1 } from "ai";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    GEMINI_API_KEY,
  } = process.env; 

const customMiddleware:middlewarev1={}
const geminiFlashModel = wrapLanguageModel({
    model:google("gemini-1.5-flash-002"),
    middleware: customMiddleware,
  });

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const embeddingModel=genAI.getGenerativeModel({model:"text-embedding-004"})


  const client =new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
  const db=client.db(ASTRA_DB_API_ENDPOINT,{namespace:ASTRA_DB_NAMESPACE})

  export  async function POST(req:Request){
    try{
        const {messages}=await req.json()
        const latestMessage=messages[messages?.length-1]?.content

        let docContext= " "
        const embedding=await embeddingModel.embedContent(latestMessage)

        try{
            const collection=await db.collection(ASTRA_DB_COLLECTION)
            const cursor=collection.find(null,{
                sort:{
                    $vector:embedding.embedding.values,
                },
                limit:10
            })

            const documents=await cursor.toArray()

            const docsMap=documents?.map(doc=>doc.text)
            docContext=JSON.stringify(docsMap)
        }catch(err){
            console.log("Error querring db....",err)
    
        }

        const template={
            role:"system",
            content:`
                You are an AI assistant who knows everything about Chess. Use the below context to augment what you know about Chess. The context will provide you  with the most recent page data from wikipedia, the official Chess and others.
                If the context doesn't include the information you need answer based on your existing knowledge and "don't mention the source of your information or what the context does or doesn't include".
                Format responses using markdown where applicable and don't return images.

                
                -------------------
                START CONTEXT
                ${docContext}
                END CONTEXT

                CURRENT TIME: ${Date.now()}
                ---------------------
                QUESTION: ${latestMessage}
                -----------------------

            `
        }
        // // DO NOT MENTION WHAT IS INCLUDED IN THE CONTEXT OR WHAT IS NOT INCLUDED .IF YOU DONT KNOW THE ANSWER JUST SAY YOU ARE UNABLE TO ANSWER THAT
        
        const coreMessages = convertToCoreMessages(messages).filter(
            (message) => message.content.length > 0,
          );

        const response=await streamText({
            model:geminiFlashModel,
            system:template.content,
            messages:coreMessages
        })
        return response.toDataStreamResponse({})

    }catch(error){
        throw error
    }
  }