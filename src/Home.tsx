import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import {
  Commitment,
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GatewayProvider } from "@civic/solana-gateway-react";
import Countdown from "react-countdown";
import { Snackbar, Paper, LinearProgress, Chip } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { AlertState, getAtaForMint, toDate } from "./utils";
import { MintButton } from "./MintButton";
import {
  awaitTransactionSignatureConfirmation,
  CANDY_MACHINE_PROGRAM,
  CandyMachineAccount,
  createAccountsForMint,
  getCandyMachineState,
  getCollectionPDA,
  mintOneToken,
  SetupState,
} from "./candy-machine";

import Footer from "./components/footer/Footer";
import "./components/page.scss";
import "./main.scss";
import "./navbar.scss";
import "./navbar.css";
import { GoMute } from "@react-icons/all-files/go/GoMute";
import { GoUnmute } from "@react-icons/all-files/go/GoUnmute";
import Warn from "./components/warn/Warn";

const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString();
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS
  ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString()
  : 9;
const splTokenName = process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME
  ? process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString()
  : "TOKEN";

const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: right;
  background: rgb(0, 0, 0, 0) !important;
  z-index: 10002;
  margin: 1%;
`;
const WalletAmount = styled.div`
  color: black;
  width: auto;
  background: rgb(0, 0, 0, 0) !important;
  //   padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
  //   border-radius: 22px;
  //   background-color: var(--main-text-color);
  //   box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  //   box-sizing: border-box;
  //   transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
  z-index: 10001;
`;
const Logo = styled.div`
  flex: 0 0 auto;

  img {
    height: 60px;
  }
`;
const Menu = styled.ul`
  list-style: none;
  display: inline-flex;
  flex: 1 0 auto;

  li {
    margin: 0 12px;

    a {
      color: var(--main-text-color);
      list-style-image: none;
      list-style-position: outside;
      list-style-type: none;
      outline: none;
      text-decoration: none;
      text-size-adjust: 100%;
      touch-action: manipulation;
      transition: color 0.3s;
      padding-bottom: 15px;

      img {
        max-height: 26px;
      }
    }

    a:hover,
    a:active {
      transition-duration: 0.2s;
      -webkit-text-stroke: 1px #efb1fa;
      transform: scale(1.1);
    }
  }
`;
const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  padding: 5px 0px 0px 0px !important;
  width: 160px !important;
  height: 100% !important;
  font-family: VALORANT;
  background: rgb(0, 0, 0, 0) !important;
  color: white;
  display: flex;
  align-items: center !important;
  justify-content: center !important;
  z-index: 10004;
  img {
    width: 0px !important;
    opacity: 0 !important;
  }
  i {
    width: 0px !important;
    margin: 0px !important;
  }
  &:hover {
    background: rgb(0, 0, 0, 0) !important;
  }
`;

const NFT = styled(Paper)`
  min-width: 500px;
  margin: 0 auto;
  padding: 5px 20px 20px 20px;
  flex: 1 1 auto;
  background-color: var(--card-background-color) !important;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22) !important;
`;

const Card = styled(Paper)`
  display: inline-block;
  background-color: var(--countdown-background-color) !important;
  margin: 5px;
  min-width: 40px;
  padding: 24px;

  h1 {
    margin: 0px;
  }
`;

const MintButtonContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  max-width: 620px;
  width: 100%;
  margin-top: 60px;
  text-align: centre;
`;

const SolExplorerLink = styled.a`
  color: var(--title-text-color);
  border-bottom: 1px solid var(--title-text-color);
  font-weight: bold;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  outline: none;
  text-decoration: none;
  text-size-adjust: 100%;

  :hover {
    border-bottom: 2px solid var(--title-text-color);
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 5em;
  margin-bottom: 2em;
  justify-content: center;
  background: url("img/cartel.gif");
`;

const MintContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 20px;
`;

const DesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 20px;
`;

const Price = styled(Chip)`
  position: absolute;
  margin: 5px;
  font-weight: bold;
  font-size: 1.2em !important;
  font-family: "Patrick Hand", cursive !important;
`;

const Image = styled.img`
  height: 400px;
  width: auto;
  border-radius: 7px;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
`;

const BorderLinearProgress = styled(LinearProgress)`
  margin: 20px;
  height: 10px !important;
  border-radius: 30px;
  border: 2px solid white;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
  background-color: var(--main-text-color) !important;

  > div.MuiLinearProgress-barColorPrimary {
    background-color: var(--title-text-color) !important;
  }

  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-image: linear-gradient(
      270deg,
      rgba(255, 255, 255, 0.01),
      rgba(255, 255, 255, 0.5)
    );
  }
`;

const ProgressBar = (props: { bgcolor: any; completed: any }) => {
  // const { bgcolor, completed } = props;
  const bgcolor = props.bgcolor;
  const completed = props.completed;

  const containerStyles = {
    height: 10,
    width: "100%",
    backgroundColor: "#e0e0de",
    borderRadius: 10,
    marginTop: 1,
  };

  const loadingbar = {
    background: "#B35CC3",
    // background: 'blue',
    borderRadius: "5px",
    width: `${completed}%`,
    height: "10px",
  };

  return (
    <div style={containerStyles}>
      <div style={loadingbar}></div>
    </div>
  );
};
export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
  network: WalletAdapterNetwork;
}

let volumes: number[] = [];
for (let i = 0; i < 18; ++i) {
  volumes.push(0);
}
const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
  const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [payWithSplToken, setPayWithSplToken] = useState(false);
  const [price, setPrice] = useState(0);
  const [priceLabel, setPriceLabel] = useState<string>("SOL");
  const [whitelistPrice, setWhitelistPrice] = useState(0);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [isBurnToken, setIsBurnToken] = useState(false);
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [isPresale, setIsPresale] = useState(false);
  const [isWLOnly, setIsWLOnly] = useState(false);

  //for navbar
  const [pagesign, setSign] = useState(0);
  const [warnShow, setWarnShow] = useState(false);
  const [moveingblock, setshowblock] = useState(false);
  const [moveingblock2, setshowblock2] = useState(false);
  const [message, setMessage] = useState("");

  //upto navbar

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });
  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [setupTxn, setSetupTxn] = useState<SetupState>();

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();

  const rpcUrl = props.rpcHost;
  const solFeesEstimation = 0.012; // approx of account creation fees

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(
    async (commitment: Commitment = "confirmed") => {
      if (!anchorWallet) {
        return;
      }

      const connection = new Connection(props.rpcHost, commitment);

      if (props.candyMachineId) {
        try {
          const cndy = await getCandyMachineState(
            anchorWallet,
            props.candyMachineId,
            connection
          );

          setCandyMachine(cndy);
          setItemsAvailable(cndy.state.itemsAvailable);
          setItemsRemaining(cndy.state.itemsRemaining);
          setItemsRedeemed(cndy.state.itemsRedeemed);

          var divider = 1;
          if (decimals) {
            divider = +("1" + new Array(decimals).join("0").slice() + "0");
          }

          // detect if using spl-token to mint
          if (cndy.state.tokenMint) {
            setPayWithSplToken(true);
            // Customize your SPL-TOKEN Label HERE
            // TODO: get spl-token metadata name
            setPriceLabel(splTokenName);
            setPrice(cndy.state.price.toNumber() / divider);
            setWhitelistPrice(cndy.state.price.toNumber() / divider);
          } else {
            setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
            setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
          }

          // fetch whitelist token balance
          if (cndy.state.whitelistMintSettings) {
            setWhitelistEnabled(true);
            setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
            setIsPresale(cndy.state.whitelistMintSettings.presale);
            setIsWLOnly(
              !isPresale &&
                cndy.state.whitelistMintSettings.discountPrice === null
            );

            if (
              cndy.state.whitelistMintSettings.discountPrice !== null &&
              cndy.state.whitelistMintSettings.discountPrice !==
                cndy.state.price
            ) {
              if (cndy.state.tokenMint) {
                setWhitelistPrice(
                  cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                    divider
                );
              } else {
                setWhitelistPrice(
                  cndy.state.whitelistMintSettings.discountPrice?.toNumber() /
                    LAMPORTS_PER_SOL
                );
              }
            }

            let balance = 0;
            try {
              const tokenBalance =
                await props.connection.getTokenAccountBalance(
                  (
                    await getAtaForMint(
                      cndy.state.whitelistMintSettings.mint,
                      anchorWallet.publicKey
                    )
                  )[0]
                );

              balance = tokenBalance?.value?.uiAmount || 0;
            } catch (e) {
              console.error(e);
              balance = 0;
            }
            if (commitment !== "processed") {
              setWhitelistTokenBalance(balance);
            }
            setIsActive(isPresale && !isEnded && balance > 0);
          } else {
            setWhitelistEnabled(false);
          }

          // end the mint when date is reached
          if (cndy?.state.endSettings?.endSettingType.date) {
            setEndDate(toDate(cndy.state.endSettings.number));
            if (
              cndy.state.endSettings.number.toNumber() <
              new Date().getTime() / 1000
            ) {
              setIsEnded(true);
              setIsActive(false);
            }
          }
          // end the mint when amount is reached
          if (cndy?.state.endSettings?.endSettingType.amount) {
            let limit = Math.min(
              cndy.state.endSettings.number.toNumber(),
              cndy.state.itemsAvailable
            );
            setItemsAvailable(limit);
            if (cndy.state.itemsRedeemed < limit) {
              setItemsRemaining(limit - cndy.state.itemsRedeemed);
            } else {
              setItemsRemaining(0);
              cndy.state.isSoldOut = true;
              setIsEnded(true);
            }
          } else {
            setItemsRemaining(cndy.state.itemsRemaining);
          }

          if (cndy.state.isSoldOut) {
            setIsActive(false);
          }

          const [collectionPDA] = await getCollectionPDA(props.candyMachineId);
          const collectionPDAAccount = await connection.getAccountInfo(
            collectionPDA
          );

          const txnEstimate =
            892 +
            (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
            (cndy.state.tokenMint ? 66 : 0) +
            (cndy.state.whitelistMintSettings ? 34 : 0) +
            (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
            (cndy.state.gatekeeper ? 33 : 0) +
            (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

          setNeedTxnSplit(txnEstimate > 1230);
        } catch (e) {
          if (e instanceof Error) {
            if (
              e.message === `Account does not exist ${props.candyMachineId}`
            ) {
              setMessage(
                `Couldn't fetch candy machine state from candy machine with address: ${props.candyMachineId}, using rpc: ${props.rpcHost}! You probably typed the REACT_APP_CANDY_MACHINE_ID value in wrong in your .env file, or you are using the wrong RPC!`
              );
              setshowblock(true);
              setTimeout(() => {
                setshowblock(false);
              }, 5000);
              // setAlertState({
              //   open: true,
              //   message: `Couldn't fetch candy machine state from candy machine with address: ${props.candyMachineId}, using rpc: ${props.rpcHost}! You probably typed the REACT_APP_CANDY_MACHINE_ID value in wrong in your .env file, or you are using the wrong RPC!`,
              //   severity: "error",
              //   hideDuration: null,
              // });
            } else if (
              e.message.startsWith("failed to get info about account")
            ) {
              setMessage(
                `Couldn't fetch candy machine state with rpc: ${props.rpcHost}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`
              );
              setshowblock(true);
              setTimeout(() => {
                setshowblock(false);
              }, 5000);
              // setAlertState({
              //   open: true,
              //   message: `Couldn't fetch candy machine state with rpc: ${props.rpcHost}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
              //   severity: "error",
              //   hideDuration: null,
              // });
            }
          } else {
            setMessage(`${e}`);
            setshowblock(true);
            setTimeout(() => {
              setshowblock(false);
            }, 5000);
            // setAlertState({
            //   open: true,
            //   message: `${e}`,
            //   severity: "error",
            //   hideDuration: null,
            // });
          }
          console.log(e);
        }
      } else {
        setMessage(
          `Your REACT_APP_CANDY_MACHINE_ID value in the .env file doesn't look right! Make sure you enter it in as plain base-58 address!`
        );
        setshowblock(true);
        setTimeout(() => {
          setshowblock(false);
        }, 5000);
        // setAlertState({
        //   open: true,
        //   message: `Your REACT_APP_CANDY_MACHINE_ID value in the .env file doesn't look right! Make sure you enter it in as plain base-58 address!`,
        //   severity: "error",
        //   hideDuration: null,
        // });
      }
    },
    [
      anchorWallet,
      props.candyMachineId,
      props.rpcHost,
      isEnded,
      isPresale,
      props.connection,
    ]
  );

  const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
    return (
      <div>
        <Card elevation={1}>
          <h1>{days}</h1>Days
        </Card>
        <Card elevation={1}>
          <h1>{hours}</h1>
          Hours
        </Card>
        <Card elevation={1}>
          <h1>{minutes}</h1>Mins
        </Card>
        <Card elevation={1}>
          <h1>{seconds}</h1>Secs
        </Card>
      </div>
    );
  };

  const renderEndDateCounter = ({ days, hours, minutes }: any) => {
    let label = "";
    if (days > 0) {
      label += days + " days ";
    }
    if (hours > 0) {
      label += hours + " hours ";
    }
    label += minutes + 1 + " minutes left to MINT.";
    return (
      <div>
        <h3>{label}</h3>
      </div>
    );
  };

  function displaySuccess(mintPublicKey: any, qty: number = 1): void {
    let remaining = itemsRemaining - qty;
    setItemsRemaining(remaining);
    setIsSoldOut(remaining === 0);
    if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
      let balance = whitelistTokenBalance - qty;
      setWhitelistTokenBalance(balance);
      setIsActive(isPresale && !isEnded && balance > 0);
    }
    setSetupTxn(undefined);
    setItemsRedeemed(itemsRedeemed + qty);
    if (!payWithSplToken && balance && balance > 0) {
      setBalance(
        balance -
          (whitelistEnabled ? whitelistPrice : price) * qty -
          solFeesEstimation
      );
    }
    setSolanaExplorerLink(
      cluster === "devnet" || cluster === "testnet"
        ? "https://solscan.io/token/" + mintPublicKey + "?cluster=" + cluster
        : "https://solscan.io/token/" + mintPublicKey
    );
    setIsMinting(false);
    throwConfetti();
  }

  function throwConfetti(): void {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = []
  ) => {
    try {
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        setIsMinting(true);
        let setupMint: SetupState | undefined;
        if (needTxnSplit && setupTxn === undefined) {
          setMessage(`Please validate account setup transaction`);
          setshowblock(true);
          setTimeout(() => {
            setshowblock(false);
          }, 5000);
          // setAlertState({
          //   open: true,
          //   message: "Please validate account setup transaction",
          //   severity: "info",
          // });
          setupMint = await createAccountsForMint(
            candyMachine,
            wallet.publicKey
          );
          let status: any = { err: true };
          if (setupMint.transaction) {
            status = await awaitTransactionSignatureConfirmation(
              setupMint.transaction,
              props.txTimeout,
              props.connection,
              true
            );
          }
          if (status && !status.err) {
            setSetupTxn(setupMint);
            setMessage(
              "Setup transaction succeeded! Please sign minting transaction"
            );
            setshowblock2(true);
            setTimeout(() => {
              setshowblock2(false);
            }, 5000);
            //   setAlertState({
            //     open: true,
            //     message:
            //       "Setup transaction succeeded! You can now validate mint transaction",
            //     severity: "info",
            //   });
            //
          } else {
            setMessage("Mint failed! Please try again!");
            setshowblock(true);
            setTimeout(() => {
              setshowblock(false);
            }, 5000);
            //   setAlertState({
            //     open: true,
            //     message: "Mint failed! Please try again!",
            //     severity: "error",
            //   });
            return;
          }
        }

        const setupState = setupMint ?? setupTxn;
        const mint = setupState?.mint ?? anchor.web3.Keypair.generate();
        let mintResult = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          mint,
          beforeTransactions,
          afterTransactions,
          setupState
        );

        let status: any = { err: true };
        let metadataStatus = null;
        if (mintResult) {
          status = await awaitTransactionSignatureConfirmation(
            mintResult.mintTxId,
            props.txTimeout,
            props.connection,
            true
          );

          metadataStatus =
            await candyMachine.program.provider.connection.getAccountInfo(
              mintResult.metadataKey,
              "processed"
            );
          console.log("Metadata status: ", !!metadataStatus);
        }

        if (status && !status.err && metadataStatus) {
          setMessage("THE TRANSACTION IS SUCCESSFUL!");
          setshowblock2(true);
          setTimeout(() => {
            setshowblock2(false);
          }, 5000);

          // setAlertState({
          //   open: true,
          //   message: "Congratulations! Mint succeeded!",
          //   severity: "success",
          // });

          // update front-end amounts
          displaySuccess(mint.publicKey);
          refreshCandyMachineState("processed");
        } else if (status && !status.err) {
          setMessage(
            "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again."
          );
          setshowblock(true);
          setTimeout(() => {
            setshowblock(false);
          }, 5000);
          // setAlertState({

          //   open: true,
          //   message:
          //     "Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.",
          //   severity: "error",
          //   hideDuration: 8000,
          // });
          refreshCandyMachineState();
        } else {
          setMessage("Mint failed! Please try again!");
          setshowblock(true);
          setTimeout(() => {
            setshowblock(false);
          }, 5000);
          // setAlertState({
          //   open: true,
          //   message: "Mint failed! Please try again!",
          //   severity: "error",
          // });
          refreshCandyMachineState();
        }
      }
    } catch (error: any) {
      let msg = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          msg = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          msg = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          msg = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          console.log(error);
          msg = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          msg = `Minting period hasn't started yet.`;
        }
      }
      setMessage(msg);
      setshowblock(true);
      setTimeout(() => {
        setshowblock(false);
      }, 5000);
      // setAlertState({
      //   open: true,
      //   message,
      //   severity: "error",
      // });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (anchorWallet) {
        const balance = await props.connection.getBalance(
          anchorWallet!.publicKey
        );
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [anchorWallet, props.connection]);

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    isEnded,
    isPresale,
    refreshCandyMachineState,
  ]);

  return (
    <div className="body">
      <MainContainer>
        <div className="navBody">
          <div className="navContainer">
            <div className="mentLeftItem">
              <div className="menuItems">
                <div className="menuItem0">
                  <img className="logoimg" src="logobg.png" alt="logo" />
                </div>
                <div onClick={() => setSign(1)} className="menuItem">
                  <div className={pagesign === 1 ? "text textstroke" : "text"}>
                    HOME
                  </div>
                </div>
                <div onClick={() => setSign(2)} className="menuItem">
                  <div className={pagesign === 2 ? "text textstroke" : "text"}>
                    <a
                      href="http://www.eewhitepaper.design/wp-content/uploads/2022/09/elveswp.pdf"
                      target="_blank"
                    >
                      WhitePaper
                    </a>
                  </div>
                </div>
                <div onClick={() => setSign(3)} className="menuItem">
                  <div className={pagesign === 3 ? "text textstroke" : "text"}>
                    <a href="www.website.com" target="_blank">
                      Website
                    </a>
                  </div>
                </div>
                <div onClick={() => setSign(4)} className="menuItem">
                  <div className={pagesign === 4 ? "text textstroke" : "text"}>
                    <a href=" https://twitter.com/EasyElves" target="_blank">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="menu-left">
              <div id="walletGroup" className="walletGroup">
                <div className="wallet-shadow"></div>
                <img className="avater" src="/assets/avatar.png" />
                {/* <Button className='avater' startIcon={<AccountCircleIcon style={{ color: 'white' }} />}></Button> */}

                <WalletContainer>
                  <Wallet>
                    {!!wallet && !!wallet.publicKey ? (
                      <WalletAmount>
                        <ConnectButton>
                          {wallet.publicKey.toBase58().substr(0, 6)}...
                          {wallet.publicKey
                            .toBase58()
                            .substr(wallet.publicKey.toBase58().length - 4, 4)}
                        </ConnectButton>
                      </WalletAmount>
                    ) : (
                      <ConnectButton />
                    )}
                  </Wallet>
                </WalletContainer>
              </div>
              <div className="burger">
                <Menu>
                  <div className="hidemenuItem">
                    <div onClick={() => setSign(1)} className="menuItem">
                      <div
                        className={pagesign === 1 ? "text textstroke" : "text"}
                      >
                        HOME
                      </div>
                    </div>
                    <div onClick={() => setSign(2)} className="menuItem">
                      <div
                        className={pagesign === 2 ? "text textstroke" : "text"}
                      >
                        <a
                          href="http://www.eewhitepaper.design/wp-content/uploads/2022/09/elveswp.pdf"
                          target="_blank"
                        >
                          WhitePaper
                        </a>
                      </div>
                    </div>
                    <div onClick={() => setSign(3)} className="menuItem">
                      <div
                        className={pagesign === 3 ? "text textstroke" : "text"}
                      >
                        <a href="www.website.com" target="_blank">
                          Website
                        </a>
                      </div>
                    </div>
                    <div onClick={() => setSign(4)} className="menuItem">
                      <div
                        className={pagesign === 4 ? "text textstroke" : "text"}
                      >
                        <a
                          href=" https://twitter.com/EasyElves"
                          target="_blank"
                        >
                          Twitter
                        </a>
                      </div>
                    </div>
                  </div>

                  <div id="walletGroup2" className="walletGroup2">
                    <div className="wallet-shadow"></div>
                    {!wallet ? (
                      <img className="avater" src="/assets/avatar.png" />
                    ) : (
                      ""
                    )}
                    <WalletContainer>
                      <Wallet>
                        {!wallet ? (
                          <WalletAmount>
                            <ConnectButton>Connect Wallet</ConnectButton>
                          </WalletAmount>
                        ) : (
                          <ConnectButton>Connect Wallet</ConnectButton>
                        )}
                      </Wallet>
                    </WalletContainer>
                  </div>
                </Menu>
              </div>
            </div>
          </div>
        </div>
        <br />
        <div className="max-main-container container">
          <div className="mainBody container">
            <div id="animation" className="animation">
              <div
                className={
                  moveingblock
                    ? "child-animation background"
                    : "btn-click background"
                }
              >
                {message}
              </div>
              <div
                className={
                  moveingblock2
                    ? "child-animation background2"
                    : "btn-click background2"
                }
              >
                {message}
              </div>
            </div>
            <div className="main-left">
              <div className="slide">
                <img src="logo.png" />
              </div>
            </div>
            <div className="main-right">
              <div>
                <div className="neroBody">
                  <div className="neroContainer">
                    <div className="title">
                      <div className="nero-title">Easy Elves</div>
                    </div>
                    <div className="progress-info">
                      <div className="progress-info-left">Globally minted</div>
                      <div className="progress-info-right">
                        {itemsRedeemed}
                        <span style={{ fontSize: "20px" }}>/</span>
                        {itemsAvailable}
                      </div>
                    </div>
                    <div className="progress">
                      <ProgressBar
                        bgcolor="#FBEC96"
                        completed={
                          itemsAvailable > 0
                            ? (itemsRedeemed * 100) / itemsAvailable
                            : 0
                        }
                      />
                    </div>
                    <div className="countdown">
                      <img src="/assets/clock_icon.png" alt="clcok" />
                      <div>00:00:00</div>
                    </div>
                    <div className="desc-title">Description</div>
                    <div className="desc">
                      Solana's genesis collection of 8888 Easy Elves inciting
                      revolution throughout the city of Sindaria. <br /> Join
                      the EASY movement.
                      {/* There's no limit to the strength of men. Everyone has a unique way to express this abstract work. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. */}
                    </div>
                    <div className="info-left-div4">
                      <div className="info-price">Price</div>
                      <div className="info-sol-sign">
                        <img src="/assets/sollogo.png" alt="price-icon" />
                        {isActive &&
                        whitelistEnabled &&
                        whitelistTokenBalance > 0
                          ? whitelistPrice + " " + priceLabel
                          : price + " " + priceLabel}
                      </div>
                    </div>
                    <div className="nero-bottom">
                      <MintButtonContainer>
                        {!isActive &&
                        !isEnded &&
                        candyMachine?.state.goLiveDate &&
                        (!isWLOnly || whitelistTokenBalance > 0) ? (
                          <Countdown
                            date={toDate(candyMachine?.state.goLiveDate)}
                            onMount={({ completed }) =>
                              completed && setIsActive(!isEnded)
                            }
                            onComplete={() => {
                              setIsActive(!isEnded);
                            }}
                            renderer={renderGoLiveDateCounter}
                          />
                        ) : !wallet ? (
                          <ConnectButton>Connect Wallet</ConnectButton>
                        ) : !isWLOnly || whitelistTokenBalance > 0 ? (
                          candyMachine?.state.gatekeeper &&
                          wallet.publicKey &&
                          wallet.signTransaction ? (
                            <GatewayProvider
                              wallet={{
                                publicKey:
                                  wallet.publicKey ||
                                  new PublicKey(CANDY_MACHINE_PROGRAM),
                                //@ts-ignore
                                signTransaction: wallet.signTransaction,
                              }}
                              // // Replace with following when added
                              // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                              gatekeeperNetwork={
                                candyMachine?.state?.gatekeeper
                                  ?.gatekeeperNetwork
                              } // This is the ignite (captcha) network
                              /// Don't need this for mainnet
                              clusterUrl={rpcUrl}
                              cluster={cluster}
                              options={{ autoShowModal: false }}
                            >
                              <MintButton
                                candyMachine={candyMachine}
                                isMinting={isMinting}
                                isActive={isActive}
                                isEnded={isEnded}
                                isSoldOut={isSoldOut}
                                onMint={onMint}
                              />
                            </GatewayProvider>
                          ) : (
                            <MintButton
                              candyMachine={candyMachine}
                              isMinting={isMinting}
                              isActive={isActive}
                              isEnded={isEnded}
                              isSoldOut={isSoldOut}
                              onMint={onMint}
                            />
                          )
                        ) : (
                          <h1>Mint is private.</h1>
                        )}
                      </MintButtonContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>

      <Footer />
      <Warn show={warnShow} closeSuccessModal={() => setWarnShow(false)} />

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
function toLocaleTimeString(
  goLiveDate: anchor.BN | undefined
): import("react").ReactNode {
  throw new Error("Function not implemented.");
}
