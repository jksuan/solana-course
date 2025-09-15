import * as web3 from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

async function transferSolManually() {
    // 1. 获取发送方密钥对 (从环境变量中获取私钥)
    const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");
    const senderPublicKey = senderKeypair.publicKey;

    // 2. 设置接收方公钥 (这里使用一个示例公钥，你需要替换为实际的接收方地址)
    const receiverPublicKey = new web3.PublicKey("7kQkZoeECHGmK4m2BqyJLR6gRpHwYa1wFSpowETFuyLQ"); // <-- 替换为你要转账到的地址

    // 3. 设置要转账的 lamports 数量 (1 SOL = 1,000,000,000 lamports)
    const LAMPORTS_TO_SEND = 0.01 * web3.LAMPORTS_PER_SOL; // 例如，转账 0.01 SOL

    // 4. 构建指令的 data 字段
    // SystemProgram.transfer 指令的 data 格式:
    // 字节 0-3: 指令类型 (2 代表 Transfer)
    // 字节 4-11: lamports 数量 (u64)
    const transferInstructionData = Buffer.alloc(12); // 4 字节指令类型 + 8 字节 lamports
    transferInstructionData.writeUInt32LE(2, 0); // 指令类型为 2 (SystemInstruction.Transfer)
    transferInstructionData.writeBigInt64LE(BigInt(LAMPORTS_TO_SEND), 4); // lamports 数量

    // 5. 创建 TransactionInstruction
    const instruction = new web3.TransactionInstruction({
        keys: [
            {
                pubkey: senderPublicKey,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: receiverPublicKey,
                isSigner: false,
                isWritable: true,
            },
        ],
        programId: web3.SystemProgram.programId, // 调用系统程序
        data: transferInstructionData,
    });

    // 6. 创建连接
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

    // 7. 创建交易并添加指令
    const transaction = new web3.Transaction().add(instruction);

    // 8. 发送并确认交易
    try {
        const signature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [senderKeypair] // 交易需要发送方签名
        );
        console.log(`✅ SOL 转账成功! 交易签名: ${signature}`);
        console.log(`发送方: ${senderPublicKey.toBase58()}`);
        console.log(`接收方: ${receiverPublicKey.toBase58()}`);
        console.log(`转账金额: ${LAMPORTS_TO_SEND / web3.LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.error("❌ SOL 转账失败:", error);
    }
}

transferSolManually();