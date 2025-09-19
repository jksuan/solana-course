import { BalanceDisplay } from '../components/tokenaccount/BalanceDisplay';
import { CreateMintForm } from '../components/tokenaccount/CreateMint';
import { CreateTokenAccountForm } from '../components/tokenaccount/CreateTokenAccount';
import { MintToForm } from '../components/tokenaccount/MintToForm';
import { SendToken } from '../components/tokenaccount/SendToken';

export default function Page() {
  return (
    <>
      <BalanceDisplay />
      <CreateMintForm />
      <CreateTokenAccountForm />
      <MintToForm />
      <SendToken />
    </>
  );
}
