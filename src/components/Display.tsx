import { FC, useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import "../Styles.css";
import Transfer from "./Transfer";
import Stake from "./Stake";

const Display: FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  let [switch_, setSwitch_] = useState(true);
  const toggleSwitch = useCallback(() => {
    setSwitch_(!switch_);
  }, [switch_]);

  const [balance, setBalance] = useState("FETCHING...");
  useEffect(() => {
    const getBalance = async (key: PublicKey | null) => {
      if (key) {
        setBalance("FETCHING...");
        const balance = await connection.getBalance(key);
        setBalance((balance / LAMPORTS_PER_SOL).toString());
      }
    };

    getBalance(publicKey);
  }, [publicKey, connection, switch_]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {publicKey ? (
        <>
          <div
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "5vw",
              color: "white",
              paddingBottom: "20px",
              textShadow: "2px 2px 9px rgba(15, 255, 80, 1)",
            }}
          >
            CONNECTED :D
          </div>
          <div className="display">{publicKey.toBase58()}</div>
          <div
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "3vw",
              color: "white",
              paddingTop: "20px",
              paddingBottom: "20px",
              textShadow: "2px 2px 9px rgba(15, 255, 80, 1)",
            }}
          >
            Current Balance
          </div>
          <div className="display">{balance}</div>
          <div
            style={{
              padding: "5vw",
              width: "50vw",
              display: "flex",
              justifyContent: "space-evenly",
            }}
          >
            <Transfer callback={toggleSwitch} />
            <Stake callback={toggleSwitch} />
          </div>
        </>
      ) : (
        <div
          style={{
            fontFamily: "Oswald, sans-serif",
            fontSize: "5vw",
            color: "white",
            textShadow: "2px 2px 9px rgba(15, 255, 80, 1)",
          }}
        >
          NO CONNECTION :(
        </div>
      )}
    </div>
  );
};

export default Display;
