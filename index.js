import Arweave from "arweave"
import { readFile } from 'fs/promises'
//import dotenv from "dotenv";
//dotenv.config();

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false, // Disable network request logging
});

// Submits a transaction and reads the data
async function run() {

  // URIs of uploaded images to pass to manifest
  let numOfNFTs = 150
  let contractFile = ""
  let image1  = "vtJRWSJiIfNc2syi6fT_xiMBTJLIrYRKpBalcIYCWEA" // Coal
  let image2  = "YswvGja57LMUL-roIko00f-tHp50Tz1HQUtjiMIm9dY" // Soy Cracker
  let image3  = "SRPglTrgq-5OG3B4NTDzIyc-V5yaWLw8KT-RpYBWBD0" // Milk + Cookies


  let manifest = {
    "manifest": "arweave/paths",
    "version": "0.1.0",
    "paths": {
      "contract": {
        "id": `${contractFile}`
      }
    }
  }

  for(let i = 0; i<numOfNFTs; i++)
  {
    let rand = Math.random()
    let fileId
    if (rand < 0.10) {                      // 10% Coal
      fileId = image1
    } else if(rand > 0.10 && rand < 0.15) { // 5% Soy Cracker
      fileId = image2
    } else if(rand > 0.15 && rand < 0.25) { // 10% Milk + Cookies
      fileId = image3
    } else if(rand > 0.25 && rand < 0.35) { // 10% Stocking
      fileId = image1
    } else if(rand > 0.35 && rand < 0.50) { // 15% Toy Car
      fileId = image2
    } else if(rand > 0.50 && rand < 0.70) { // 20% Hot Chocolate
      fileId = image3
    } else if(rand > 0.70 && rand < 1.00) { // 30% Ginger Bread Man
      fileId = image1
    } else {
      fileId = image2
    }
    manifest.paths[i] = {
      "id": `${fileId}`
    }
  }

  const key = JSON.parse(
    await readFile(
      new URL('./arweave-key.json', import.meta.url)
    )
  )

  const transaction = await arweave.createTransaction(
    {
      data: JSON.stringify(manifest)
    },
    key
  )

  console.log(manifest)

  // Tells Arweave that this file will be a Path Manifest, otherwise it will behave as a file
  transaction.addTag('Content-Type', 'application/x.arweave-manifest+json')
  transaction.addTag('type', 'manifest')

  await arweave.transactions.sign(transaction, key);
  const response = await arweave.transactions.post(transaction);

  // Transaction ID gets updated after arweave.transactions.post, which is a bit unintuitive
  console.log(response.status)
  console.log("transaction ID", transaction.id);

  // Read data back
  const transactionData = await arweave.transactions.getData(transaction.id);
  console.log(
    "transaction data",
    Buffer.from(transactionData, "json").toString()
  );
}

run();