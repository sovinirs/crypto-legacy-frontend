import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { ethers, BigNumber } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";
import legacyabi from "../components/abi/LegacyABI.json";
import erc20abi from "../components/abi/ERC20ABI.json";
import Modal from "../components/core/Modal";

export default function Home() {
  const [contractAddress] = useState(
    "0xD9b4940B748d8C892D3112f78f15EA37f5712159"
  );
  const [hasChromeExtension, setHasChromeExtension] = useState(false);
  const [ethAccounts, setEthAccounts] = useState([]);
  const [chainId] = useState("80001");
  const [balancesData, setBalancesData] = useState(undefined);
  const [netWorth, setNetWorth] = useState(0);

  const [approvalCompleted, setApprovalCompleted] = useState(false);
  const [gasPriceIssue, setGasPriceIssue] = useState(false);
  const [showCWModal, setShowCWModal] = useState(false);
  const [pageState, setPageState] = useState("#1");
  const [abFuncAllowanceAmount, setAbFuncAllowanceAmount] = useState("");
  const [abFuncBeneficiaryId, setAbFuncBeneficiaryId] = useState("");
  const [abFuncTransferAmount, setAbFuncSetTransferAmount] = useState("");
  const [abFuncExpiryDate, setAbFuncExpiryDate] = useState("");
  const [currentToken, setCurrentToken] = useState({});

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
      //const chainId = await ethereum.request({ method: "eth_chainId" });

      // logic to check for the chain ID and request for change
      //setChainId(parseInt(chainId));

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

  const handleApprove = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const assetContract = new ethers.Contract(
      currentToken.contract_address,
      erc20abi,
      signer
    );

    // maturity date of the will in UnixEpoch Time Stamp
    // const date = new Date(abFuncExpiryDate);
    // const unixTimestamp = Math.floor(date.getTime() / 1000);

    try {
      var transaction = await assetContract
        .approve(
          contractAddress,
          ethers.utils.parseUnits(
            abFuncAllowanceAmount,
            currentToken.contract_decimals
          )
        )
        .catch((e) => {
          throw e;
        });

      var transactResult = await transaction.wait();
      console.log(transactResult);
      if (transactResult.blockHash) {
        setApprovalCompleted(true);
      }
    } catch (e) {
      setGasPriceIssue(true);
      setTimeout(() => {
        setGasPriceIssue(false);
      }, 3000);
    }
  };

  const handleAddBeneficiary = async () => {
    // try to load the contract
    //const erc20 = new ethers.Contract(contractAddress, erc20abi, provider);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const legacyContract = new ethers.Contract(
      contractAddress,
      legacyabi,
      signer
    );

    // const assetContract = new ethers.Contract(
    //   currentToken.contract_address,
    //   erc20abi,
    //   signer
    // );
    console.log(legacyContract);

    // maturity date of the will in UnixEpoch Time Stamp
    const date = new Date(abFuncExpiryDate);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    let allowance = ethers.utils
      .parseEther(currentToken.balance, currentToken.decimals)
      .toString();
    allowance = BigNumber.from(currentToken.balance.toString());

    // console.log(typeof currentToken.balance);
    // console.log(currentToken.balance);
    // console.log(BigNumber.from(currentToken.balance));
    // console.log({
    //   assetAddress: currentToken.contract_address,
    //   assetType: 0,
    //   expiresAt: unixTimestamp,
    //   allowance,
    //   recepients: [
    //     {
    //       receiver: abFuncBeneficiaryId,
    //       sharedPercentBps: 100,
    //       denominator: 100,
    //       id: 0,
    //     },
    //   ],
    // });

    var tx = await legacyContract.createWill({
      assetAddress: currentToken.contract_address,
      assetType: BigNumber.from(0),
      expiresAt: BigNumber.from(unixTimestamp),
      allowance,
      recepients: [
        {
          receiver: abFuncBeneficiaryId,
          sharedPercentBps: 100,
          denominator: 100,
          id: 0,
        },
      ],
    });
    console.log("AFter tx");
    var txRes = await tx.wait();
    console.log(txRes);
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

  // on balance change update net worth of the address
  useEffect(() => {
    if (balancesData && balancesData.items.length) {
      var total = 0;
      balancesData.items.forEach((item) => {
        var balanceOfItem = parseInt(
          ethers.utils.formatEther(item.balance, item.contract_decimals)
        );
        total += balanceOfItem;
      });
    }
    setNetWorth(total);
  }, [balancesData]);

  useEffect(() => {
    if (abFuncExpiryDate.length == 4 || abFuncExpiryDate.length == 7) {
      setAbFuncExpiryDate(abFuncExpiryDate + "-");
    }
  }, [abFuncExpiryDate]);

  return (
    <div className="p-10 h-full">
      <Modal
        show={showCWModal}
        beneficiaryId={abFuncBeneficiaryId}
        transferAmount={abFuncTransferAmount}
        expiryDate={abFuncExpiryDate}
        currentToken={currentToken}
        allowanceAmount={abFuncAllowanceAmount}
        approvalCheck={approvalCompleted}
        handleAddBeneficiary={handleAddBeneficiary}
        setShow={setShowCWModal}
        setBeneficiaryId={setAbFuncBeneficiaryId}
        setTransferAmount={setAbFuncSetTransferAmount}
        setExpiryDate={setAbFuncExpiryDate}
        setCurrentToken={setCurrentToken}
        handleApprove={handleApprove}
        setAllowanceAmount={setAbFuncAllowanceAmount}
      />
      {hasChromeExtension ? (
        <>
          <div id="nav-bar" className="flex items-center">
            <div className="flex items-center">
              <div className="font-bold text-3xl">Dashboard</div>
              <button className="ml-5 px-5 py-1 rounded-xl border-gray-400 border-2">
                {ethAccounts.length &&
                  ethAccounts[0].substring(0, 5) +
                    "..." +
                    ethAccounts[0].slice(-5)}
              </button>
              <button className="ml-5 px-5 py-1 rounded-xl border-gray-400 border-2">
                Mumbai Testnet
              </button>
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
                <button
                  className={
                    pageState == "#1"
                      ? "bg-blue-500 text-white rounded-2xl px-5 py-1"
                      : "rounded-2xl px-5 py-1"
                  }
                  onClick={() => setPageState("#1")}
                >
                  Tokens
                </button>
                <button
                  className={
                    pageState == "#2"
                      ? "bg-blue-500 text-white rounded-2xl px-5 py-1"
                      : "rounded-2xl px-5 py-1"
                  }
                  onClick={() => setPageState("#2")}
                >
                  Beneficiaries
                </button>
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
                balancesData.items.map((item, index) => (
                  <div
                    className="border-b-2"
                    key={item.contract_ticker_symbol + index}
                  >
                    <div className="flex items-center px-5 py-3">
                      <div className="w-1/2 flex items-center">
                        <div className="w-10 -ml-2">
                          {item.contract_ticker_symbol != "MET" &&
                            item.contract_ticker_symbol != "WETH" &&
                            item.contract_ticker_symbol != "CKIE" && (
                              <img src={item.logo_url} alt="logo_url" />
                            )}
                        </div>
                        <div className="ml-1">{item.contract_name}</div>
                      </div>
                      <div className="w-1/3">${item.quote}</div>
                      <div className="w-1/3">
                        {ethers.utils
                          .formatEther(item.balance, item.contract_decimals)
                          .substring(0, 4)}
                      </div>
                      <div className="w-1/3">
                        {!item.native_token ? (
                          <button
                            className="text-white text-sm bg-gray-600 px-5 py-2 rounded-2xl"
                            onClick={() => {
                              setCurrentToken(item);
                              setShowCWModal(true);
                            }}
                          >
                            Add a Beneficiary
                          </button>
                        ) : (
                          <div className="text-gray-600 text-sm">
                            Native Token Not Supported
                          </div>
                        )}
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
