import Arweave from "arweave";
import fs from 'fs';
import path from "node:path";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false, // Disable network request logging
});

// Read key in from arweave-key.json
const key = JSON.parse(fs.readFileSync('./arweave-key.json', 'utf-8'));

arweave.wallets.jwkToAddress(key).then(async (address) => {
  console.log("Using:", address);
  const bal = await arweave.wallets.getBalance(address)
  console.log("Balance:", arweave.ar.winstonToAr(bal))
});

function printStatus(response) {
  console.log(response.status, `${response.status === 200 ? '\x1b[32m OK\x1b[0m' : '\x1b[31m FAIL \x1b[0m' + response.statusText}`)
}

/**
 * Uploads all files in the a given folder path to Arweave, returns an array of the Arweave tx hashes.
 */
async function readFiles(folderPath) {
  let arHashes = [];
  try {
    // Get file paths
    const fileNames = await fs.readdirSync(folderPath)
    const filePaths = fileNames.map(fn => path.join(folderPath, fn))
    for (const [index, file] of filePaths.entries()) {
      console.log("Attempting to publish:", file)

      const fileType = file.split('.')[1]
      const isContract = fileType === 'sol' || fileType === 'vy'

      const fileData = fs.readFileSync(file);

      const tx = await arweave.createTransaction({
        data: (isContract) ? fileData : fileData.buffer
      }, key)

      // Get content type of file. If the file is a solidity contract, set the
      // content type to text/solidity. Otherwise, set the content type to the
      // file extension.
      const contentType = (!isContract)
        ? `image/${fileType}`
        : 'text/plain'
      // Set content type tag on Arweave txn
      tx.addTag('Content-Type', contentType)

      await arweave.transactions.sign(tx, key)
      // Use transaction uploader for anything that's not a Solidity or Vyper contract
      if(!isContract) {
        let uploader = await arweave.transactions.getUploader(tx)
        // Wait for upload to complete before moving to next
        while(!uploader.isComplete) {
          await uploader.uploadChunk()
        }
      } else {
        const res = await arweave.transactions.post(tx)
        printStatus(res)
      }
      console.log("\x1b[32mUpload Complete. \x1b[0mTransaction ID", tx.id)
      // Store transaction ID in array
      arHashes.push({
        name: (isContract) ? file.split('/')[1] : index,
        uri: tx.id
      })
    }
  } catch (err) {
    console.warn(err)
  }
  return arHashes
}

(async function() {
  let manifest = {
    "manifest": "arweave/paths",
    "version": "0.1.0",
    "paths": {
      "contracts": {}
    }
  }

  const contractFileHashes = await readFiles('./contracts/');
  const imageFileHashes = await readFiles('./inputs/');

  for (const hash of contractFileHashes) {
    manifest.paths.contracts[hash.name] = `${hash.uri}`
  }
  for (const hash of imageFileHashes) {
    manifest.paths[hash.name] = {
      "id": `${hash.uri}`
    }
  }

  // Create manifest
  const transaction = await arweave.createTransaction({
    data: JSON.stringify(manifest)
  }, key)

  console.log('=== Manifest Created ===')
  console.log(manifest)
  console.log('=== End Manifest ===')

  // Tells Arweave that this file will be a Path Manifest, otherwise it will behave as a file
  transaction.addTag('Content-Type', 'application/x.arweave-manifest+json')
  transaction.addTag('type', 'manifest')

  await arweave.transactions.sign(transaction, key);
  const response = await arweave.transactions.post(transaction);

  // Transaction ID gets updated after arweave.transactions.post, which is a bit unintuitive
  printStatus(response);
  console.log("Transaction ID", transaction.id);

  // Logs transaction hash of newly created path manifest for date and hour of generation.
  fs.writeFileSync(`out/${new Date().toString()}.txt`, transaction.id)
})();