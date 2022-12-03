import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import MetaMaskOnboarding from "@metamask/onboarding";

export default function Home() {
  const [hasChromeExtension, setHasChromeExtension] = useState(false);
  const [ethAccounts, setEthAccounts] = useState([]);
  const [chainId, setChainId] = useState(undefined);
  const [balancesData, setBalancesData] = useState(undefined);
  const [netWorth, setNetWorth] = useState(0);

  // check if MetaMask extension is installed
  const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  // forwarding to MetaMask extension page if not installed
  const metaMaskOnboarding = () => {
    const forwarderOrigin = "https://fwd.metamask.io";
    const onboarding = new MetaMaskOnboarding({ forwarderOrigin });
    onboarding.startOnboarding();
  };

  // function to get ethereum account from MetaMask extension
  const requestEthAccount = async () => {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request({ method: "eth_accounts" });
      const chainId = await ethereum.request({ method: "eth_chainId" });

      // logic to check for the chain ID and request for change
      setChainId(parseInt(chainId, 16));

      // update EthAccounts State
      setEthAccounts(accounts);
    } catch (e) {
      console.log(e);
    }
  };

  // get ethereum account details
  const fetchBalances = async () => {
    const balancesResponse = await fetch(
      `/api/balances?ethAddress=${ethAccounts[0]}&chainId=${chainId}`
    );
    const balancesData = await balancesResponse.json();
    setBalancesData(balancesData.data);
  };

  // on window load check if MetaMask Chrome Extension is installed
  useEffect(() => {
    setHasChromeExtension(isMetaMaskInstalled());
  }, []);

  // if chrome extension is installed, fetch ethereum accounts
  useEffect(() => {
    if (hasChromeExtension) {
      requestEthAccount();
    }
  }, [hasChromeExtension]);

  // if Ethereum accounts list has been updated
  useEffect(() => {
    if (ethAccounts.length > 0) {
      // get all account balances with respect to the Ethereum account
      fetchBalances();
    }
  }, [ethAccounts]);

  useEffect(() => {
    if (balancesData && balancesData.items.length) {
      var total = 0;
      balancesData.items.forEach((item) => {
        var balanceOfItem = parseInt(
          item.balance.substring(0, item.contract_decimals)
        );
        total += balanceOfItem;
      });
    }
    setNetWorth(total);
  }, [balancesData]);

  return (
    <div className="p-10 h-full">
      {hasChromeExtension ? (
        <>
          <div id="nav-bar" className="flex items-center">
            <div className="flex items-center">
              <div className="font-bold text-3xl">Portfolio</div>
              <div className="ml-5 px-5 py-1 rounded-xl border-gray-400 border-2">
                {ethAccounts.length &&
                  ethAccounts[0].substring(0, 5) +
                    "..." +
                    ethAccounts[0].slice(-5)}
              </div>
              <div className="ml-5 px-5 py-1 rounded-xl border-gray-400 border-2">
                {chainId
                  ? chainId == 137
                    ? "Polygon"
                    : { chainId }
                  : "Connect to a Network"}
              </div>
            </div>
            <div className="flex absolute right-10">
              <div className="mr-5 px-5 py-1 rounded-xl border-gray-400 border-2">
                USD
              </div>
              <div className="px-5 py-1 rounded-xl border-gray-400 border-2">
                Points
              </div>
            </div>
          </div>
          <div className="mt-10">
            <div className="">Networth</div>
            <div className="text-xl font-bold">${netWorth}</div>
          </div>
          <div
            className="mt-10 p-5 rounded drop-shadow-md"
            style={{ background: "white", height: "70%" }}
          >
            <div className="flex items-center">
              <div className="ml-1">Assets</div>
              <div className="flex absolute right-10 border-2 border-gray-400 rounded-3xl mr-5">
                <button className="bg-blue-500 text-white rounded-2xl px-5 py-1">
                  Tokens
                </button>
                <button className="rounded-2xl px-5 py-1">NFTs</button>
                <button className="rounded-2xl px-5 py-1">Transactions</button>
              </div>
            </div>

            <div className="mt-10">
              <div className="border-b-2">
                <div className="flex px-5 pb-3">
                  <div className="w-1/2 text-gray-500">Token</div>
                  <div className="w-1/3 text-gray-500">Price</div>
                  <div className="w-1/3 text-gray-500">Balance</div>
                  <div className="w-1/3 text-gray-500"></div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              {balancesData &&
                balancesData.items.length &&
                balancesData.items.map((item) => (
                  <div className="border-b-2" key={item.contract_ticker_symbol}>
                    <div className="flex items-center px-5 pb-3">
                      <div className="w-1/2 flex items-center">
                        <div className="w-10 -ml-2">
                          <img src={item.logo_url} alt="logo_url" />
                        </div>
                        <div className="ml-1">{item.contract_name}</div>
                      </div>
                      <div className="w-1/3">${item.quote}</div>
                      <div className="w-1/3">
                        ${item.balance.substring(0, item.contract_decimals)}
                      </div>
                      <div className="w-1/3">
                        <button className="text-white bg-gray-600 px-5 py-1 rounded-2xl">
                          Create will
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div id="install-extension-container">
            <div className="text-center">
              It seems that you have not installed MetaMask Chrome Extension
            </div>
            <div className="flex justify-center mt-3">
              <button
                className="rounded px-10 py-3 bg-gray-500 text-white"
                onClick={() => metaMaskOnboarding()}
              >
                Click here to install the Chrome Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
