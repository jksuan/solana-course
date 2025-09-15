import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
// import { getDomainKeySync, NameRegistryState, getHashedNameSync } from "@solana/spl-name-service";

const suppliedPublicKey = process.argv[2];
if (!suppliedPublicKey) {
    console.error("Error: Please provide a public key to check the balance of!");
    process.exit(1); // 退出程序，表示错误
}

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

let publicKey: PublicKey;
try {
    publicKey = new PublicKey(suppliedPublicKey);
} catch (error) {
    console.error(`Error: Invalid public key provided: ${suppliedPublicKey}`);
    process.exit(1); // 退出程序，表示错误
}

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
    `✅ Finished! The balance for the wallet at address ${publicKey} is ${balanceInSOL}!`
);