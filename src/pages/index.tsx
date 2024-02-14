import React, { useState } from "react";
import { ethers } from "ethers";
import { Migrator, WALLET_TYPE } from "@aarc-xyz/migrator";
import { GetServerSideProps } from "next";
import { SmartAccountResponse } from "@aarc-xyz/migrator";

interface HomeProps {
  eoaAddress: string;
}

const Home: React.FC<HomeProps> = ({ eoaAddress }) => {
  const [smartWallets, setSmartWallets] = useState<SmartAccountResponse[]>([]);
  const [selectedWallet, setSelectedWallet] =
    useState<SmartAccountResponse | null>(null);
  const aarcApiKey = process.env.NEXT_PUBLIC_AARC_API_KEY as string;

  let aarcSDK = new Migrator({
    rpcUrl: "https://rpc.ankr.com/polygon_mumbai",
    chainId: 80001,
    apiKey: aarcApiKey,
  });

  const getSmartWalletAddress = async () => {
    try {
      const smartWalletAddresses: SmartAccountResponse[] =
        await aarcSDK.getSmartWalletAddresses(WALLET_TYPE.BICONOMY, eoaAddress);
      setSmartWallets(smartWalletAddresses);
    } catch (error) {
      console.error("Error fetching smart wallet addresses: ", error);
    }
  };

  const handleWalletClick = (wallet: SmartAccountResponse) => {
    setSelectedWallet(wallet === selectedWallet ? null : wallet); // Toggle selected wallet
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-8 p-24">
      <div className="text-[4rem] font-bold text-orange-400">Biconomy-Aarc</div>

      <button
        className="w-auto px-4 h-[3rem] bg-orange-300 text-black font-bold rounded-lg"
        onClick={getSmartWalletAddress}
      >
        Get Smart Wallet Address
      </button>

      {smartWallets && (
        <div className="w-[40%] flex flex-col items-start">
          {smartWallets.map((wallet) => (
            <div
              key={wallet.address}
              className="w-full border-orange-400 border-2 mb-4 rounded-lg"
            >
              <button
                onClick={() => handleWalletClick(wallet)}
                className="text-left w-full py-2 px-4 rounded-lg hover:bg-orange-400"
              >
                {wallet.address}
              </button>
              {selectedWallet === wallet && (
                <div className="ml-4 mt-2 p-2 border-l-4 border-orange-300">
                  <div>Is Deployed: {wallet.isDeployed ? "Yes" : "No"}</div>
                  <div>Wallet Index: {wallet.walletIndex}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/polygon_mumbai"
  );
  const pvtKey = process.env.PRIVATE_KEY as string;
  const signer = new ethers.Wallet(pvtKey, provider);
  const eoaAddress = signer.address;

  return {
    props: { eoaAddress },
  };
};

export default Home;
