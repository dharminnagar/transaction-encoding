import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    type Signer,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

// Only have the receiver's key in the encoded transaction
// The sender key will be provided when the QR code is scanned
const receiverKey = "BSAtSn5rWK827dzFiQSbRzAkH44EB9EckMXWrVN2tn4c";
const amountInSOL = 0.1;

async function createPartialTransaction() {
    try {
        // Create a new transaction without specifying the sender yet
        const transaction = new Transaction();
        const receiver = new PublicKey(receiverKey);

        // Get the latest blockhash
        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("finalized");
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;

        // Create the transfer instruction without specifying the sender
        // This will be filled in when the QR code is scanned
        const transferInstruction = SystemProgram.transfer({
            // We'll use a placeholder for the fromPubkey that will be replaced
            fromPubkey: new PublicKey(new Uint8Array(32)), // Temporary placeholder key
            toPubkey: receiver,
            lamports: amountInSOL * LAMPORTS_PER_SOL,
        });

        // Store the instruction data separately
        const instructionData = {
            programId: transferInstruction.programId.toString(),
            keys: transferInstruction.keys.map((key) => ({
                pubkey: key.pubkey.toString(),
                isSigner: key.isSigner,
                isWritable: key.isWritable,
            })),
            data: Buffer.from(transferInstruction.data).toString("base64"),
        };

        // Store the transaction metadata
        const transactionMetadata = {
            receiverAddress: receiverKey,
            amountInSOL: amountInSOL,
            recentBlockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight,
            instructionData: instructionData,
        };

        // Encode the transaction metadata as JSON and then to base64
        const encodedTransactionMetadata = Buffer.from(
            JSON.stringify(transactionMetadata)
        ).toString("base64");

        console.log("Encoded Transaction Metadata:");
        console.log(encodedTransactionMetadata);

        return encodedTransactionMetadata;
    } catch (e) {
        console.error("Error creating partial transaction:", e);
        throw e;
    }
}

// This function would be called when the QR code is scanned
async function reconstructAndSignTransaction(
    encodedMetadata: string,
    senderPublicKey: string,
    senderKeypair: Signer
) {
    try {
        // Decode the transaction metadata
        const metadata = JSON.parse(
            Buffer.from(encodedMetadata, "base64").toString()
        );

        // Create a new transaction
        const transaction = new Transaction();
        transaction.recentBlockhash = metadata.recentBlockhash;
        transaction.lastValidBlockHeight = metadata.lastValidBlockHeight;

        // Set the fee payer as the sender
        const sender = new PublicKey(senderPublicKey);
        transaction.feePayer = sender;

        // Reconstruct the transfer instruction
        const receiver = new PublicKey(metadata.receiverAddress);
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: receiver,
            lamports: metadata.amountInSOL * LAMPORTS_PER_SOL,
        });

        // Add the instruction to the transaction
        transaction.add(transferInstruction);

        // Sign the transaction with the sender's keypair
        // (This part would happen on the user's device after scanning)
        transaction.sign(senderKeypair);

        // Serialize the transaction for sending
        const serializedTransaction = transaction.serialize();

        return serializedTransaction;
    } catch (e) {
        console.error("Error reconstructing transaction:", e);
        throw e;
    }
}

// Example usage
async function main() {
    // Generate the encoded transaction metadata for the QR code
    const encodedMetadata = await createPartialTransaction();
    console.log(
        "This encoded metadata would be embedded in the QR code or App Clip code"
    );

    // The rest is pseudo-code for what would happen when the user scans the code
    /*
    // When user scans the code with their wallet:
    const senderPublicKey = "user_wallet_public_key"; // From the user's wallet
    const senderKeypair = "user_wallet_keypair"; // From the user's wallet
    
    // Reconstruct and sign the transaction
    const signedTransaction = await reconstructAndSignTransaction(
        encodedMetadata, 
        senderPublicKey, 
        senderKeypair
    );
    
    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction);
    console.log("Transaction sent with signature:", signature);
    */
}

main();
