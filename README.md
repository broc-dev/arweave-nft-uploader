# Arweave NFT Image Uploader

A utility that uploads all image files in the 'input' folder as well as any Solidity or Vyper contract sources in the 'contracts' folder, then creates and uploads an Arweave path manifest pointing to those images on Arweave.
Useful for NFT projects hosting on Arweave. Requires an Arweave wallet keyfile with AR in it.

*Optional:* Include contract sources in the 'contracts' folder to be added a contracts section in the path manifest. The contract sources will be uploaded to Arweave, but will not be accessible through the path manifest. View the path manifest on Arweave to see the contract source URIs.

## Usage

### Prerequisites
1. NodeJS
2. An Arweave wallet keyfile with AR in it
3. Image files in the 'input' folder, in numerical order, starting from 0. For example: 0.png, 1.png, 2.png, etc.

### Steps
1. Install dependencies: `npm install`
2. Export your Arweave wallet keyfile in the root directory and rename it to `arweave-key.json`
3. Enter `npm run start` to upload all images and contracts to Arweave. The path manifest will be printed to the console, as well as saved in the 'out' folder.
4. Retrieve the path manifest from the 'out' folder and use it in your project.
5. View your new path manifest with an Arweave gateway of choice, for example: `https://arweave.net/raw/[Manifest Hash]`. To test out your manifest, you can use routing to view the images, for example: `https://arweave.net/[Manifest Hash]/5`

## Example Manifest

```json
{
  manifest: 'arweave/paths',
  version: '0.1.0',
  paths: {
    '0': { id: 'FMCyXyLNYi0aBQJPCOdrRL8wvpr-OLXRlbuYoWSQ5k4' },
    '1': { id: 'MwsY5NxfUIh_EBuByQYGCZe51IeBVxwVD37M2_vLxIg' },
    '2': { id: 'CzRgQSqRe5GSauz3YwrNMEZD74uviMkWjUXnEYddScw' },
    contracts: { 'example.sol': '0czYEiBF3z_RPlS_vJA-k5E3Tl7XNDnvzUaZoq6csDA' }
  }
}
```