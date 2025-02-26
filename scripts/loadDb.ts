import { DataAPIClient } from "@datastax/astra-db-ts";

import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import "dotenv/config";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_API_KEY,
} = process.env;

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

// const f1Data = ["https://en.wikipedia.org/wiki/Chess",
//   "https://www.fide.com/news/",
//   "https://calendar.fide.com/calendar.php",
//   "https://en.wikipedia.org/wiki/World_Chess_Championship",
//   "https://en.wikipedia.org/wiki/List_of_chess_players_by_peak_FIDE_rating",
// "https://en.wikipedia.org/wiki/Chess_prodigy",
// "https://en.wikipedia.org/wiki/List_of_female_chess_grandmasters"
// https://en.wikipedia.org/wiki/Grandmaster_(chess),
// https://www.mpl.live/blog/world-chess-championship/,
// "https://www.chess.com/article/view/the-best-chess-openings-for-beginners",
//   "https://www.themost10.com/top-ten-chess-players-2025/"



// ];
const f1Data = ["https://en.wikipedia.org/wiki/Chess_prodigy",
  "https://en.wikipedia.org/wiki/Grandmaster_(chess)",
  "https://www.mpl.live/blog/world-chess-championship/",
  "https://www.chess.com/article/view/the-best-chess-openings-for-beginners",
  "https://www.themost10.com/top-ten-chess-players-2025/"
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const text_splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 768,
      metric: similarityMetric,
    },
  });
  console.log(res);
};
const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  for await (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = await text_splitter.splitText(content);

    for await (const chunk of chunks) {
      const embedding = await embeddingModel.embedContent(chunk);
      const vector = embedding.embedding.values;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
      console.log(res);
    }
  }
};

// createCollection().then(() => loadSampleData());
loadSampleData();
