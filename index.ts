import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

const senderKey = "8Wr9JjqiqJwUCeALhPRi9Euy8bp6rwW95FABg3TvSPoL";
const receiverKey = "BSAtSn5rWK827dzFiQSbRzAkH44EB9EckMXWrVN2tn4c";

async function createEncodedTransaction() {
    const transaction = new Transaction();
    const sender = new PublicKey(senderKey);
    const receiver = new PublicKey(receiverKey);

    try {
        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("finalized");
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = sender;

        const transferInstruction = SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: receiver,
            lamports: 0.1 * LAMPORTS_PER_SOL,
        });
        transaction.add(transferInstruction);

        // TODO: Encode the transaction
        const encodedTransaction = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
        });
        console.log(encodedTransaction.toString("base64"));

        // TODO: decode the transaction
        // const decodedTransaction = Transaction.decode(encodedTransaction);
        const decodedTransaction = Transaction.from(encodedTransaction);
        console.log(decodedTransaction);
    } catch (e) {
        console.log(e);
    }
}

createEncodedTransaction();
