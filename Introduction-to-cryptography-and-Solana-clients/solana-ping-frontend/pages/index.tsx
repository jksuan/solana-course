import { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import WalletContextProvider from '../components/WalletContextProvider'
// import { BalanceDisplay } from '../components/BalanceDisplay'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const Home: NextPage = (props) => {

  const DynamicAppBar = dynamic(() => import('../components/AppBar').then((mod) => mod.AppBar), { ssr: false });
  const DynamicPingButton = dynamic(() => import('../components/PingButton').then((mod) => mod.PingButton), { ssr: false });

  return (
    <div className={styles.App}>
      <Head>
        <title>Wallet-Adapter Example</title>
        <meta
          name="description"
          content="Wallet-Adapter Example"
        />
      </Head>
      <WalletContextProvider>
        <DynamicAppBar />
        <div className={styles.AppBody}>
          <DynamicPingButton />
        </div>
      </WalletContextProvider >
    </div>
  );
}

export default Home;