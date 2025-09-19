'use client';

import { FC, useState } from 'react';
import styles from '../../app/styles/Home.module.css';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';

export const SendToken: FC = () => {
  const [txSig, setTxSig] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : '';
  };

  const sendToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      setError('请先连接你的钱包');
      return;
    }

    setLoading(true);
    setError('');
    setTxSig('');

    try {
      const formData = new FormData(event.currentTarget);
      const recipientAddressStr = formData.get('recipient') as string;
      const mintAddressStr = formData.get('mint') as string;
      const amountStr = formData.get('amount') as string;

      if (!recipientAddressStr || !mintAddressStr || !amountStr) {
        throw new Error('所有字段都不能为空');
      }

      // 1. 数据准备
      const mint = new PublicKey(mintAddressStr);
      const recipient = new PublicKey(recipientAddressStr);
      const amount = parseFloat(amountStr);
      const decimals = 2; // BigDog代币的精度
      const amountToSend = amount * Math.pow(10, decimals);
      console.log(`发送金额: ${amountToSend} 个单位`);

      // 2. 获取发送方和接收方的关联代币账户（ATA）地址
      const fromAtaAddress = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const toAtaAddress = await getAssociatedTokenAddress(
        mint,
        recipient,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log(`发送方 ATA: ${fromAtaAddress.toBase58()}`);
      console.log(`接收方 ATA: ${toAtaAddress.toBase58()}`);

      // 3. 创建一个原子交易
      const transaction = new Transaction();

      // 4. 检查接收方的ATA是否存在，如果不存在则添加创建指令
      const recipientAtaInfo = await connection.getAccountInfo(toAtaAddress);
      if (!recipientAtaInfo) {
        console.log('接收方的代币账户不存在，将创建它。');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // 支付创建费用的账户
            toAtaAddress, // 要创建的ATA地址
            recipient, // ATA的所有者
            mint, // 代币的Mint地址
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      } else {
        console.log('接收方的代币账户已存在。');
      }

      // 5. 添加代币转账指令
      transaction.add(
        createTransferCheckedInstruction(
          fromAtaAddress, // 从哪个账户转出
          mint, // 代币的Mint地址
          toAtaAddress, // 转到哪个账户
          publicKey, // 发送方钱包地址（所有者）
          amountToSend, // 发送数量 (Uints)
          decimals, // 代币精度
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // 6. 发送交易
      const signature = await sendTransaction(transaction, connection);
      console.log(`交易签名: ${signature}`);

      // 7. 等待交易确认
      await connection.confirmTransaction(signature, 'confirmed');

      setTxSig(signature);
    } catch (e: any) {
      console.error('发送失败:', e);
      setError(`交易失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-gray-200 mt-10">
      {publicKey ? (
        <form onSubmit={sendToken} className="space-y-6">
          <div>
            <label
              htmlFor="mint"
              className="block text-sm font-medium text-white"
            >
              Token Mint 地址:
            </label>
            <input
              id="mint"
              name="mint"
              type="text"
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="输入你的Token Mint地址"
              required
              defaultValue="GTEjfkUHMi35DvteiZahxCjZ11cSCywdAKWFNNvfnqqJ"
            />
          </div>

          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-white"
            >
              接收方钱包地址:
            </label>
            <input
              id="recipient"
              name="recipient"
              type="text"
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="输入接收方的钱包地址"
              required
              defaultValue="7kQkZoeECHGmK4m2BqyJLR6gRpHwYa1wFSpowETFuyLQ"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-white"
            >
              转账数量:
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="例如: 2"
              required
              defaultValue="2"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
            disabled={loading}
          >
            {loading ? '正在发送...' : '发送 Solana Training Token'}
          </button>
        </form>
      ) : (
        <div className="text-center text-gray-400">
          <p>请先连接钱包以发送代币</p>
        </div>
      )}
      {txSig ? (
        <div className="text-center mt-6 p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
          <p className="font-semibold">✅ 交易成功!</p>
          <p className="mt-2">在 <a className={styles.link} href={link()} target="_blank" rel="noopener noreferrer"> Solana Explorer </a> 上查看交易详情</p>          
        </div>
      ) : null}
      {error ? (
        <div className="text-center mt-6 p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          <p className="font-semibold">❌ 发生错误:</p>
          <p className="mt-2 break-words">{error}</p>
        </div>
      ) : null}
    </div>
  );
};
