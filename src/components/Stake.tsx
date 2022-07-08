import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  StakeProgram,
  SystemProgram,
  Keypair,
  Authorized,
} from "@solana/web3.js";
import { FC, useCallback, useState } from "react";
import "../Styles.css";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";

const Stake: FC<{callback: () => void}> = ({callback}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [backdrop, setBackdrop] = useState(false);

  const [errorAlert, setErrorAlert] = useState(false);
  const closeErrorAlert = () => {
    setErrorAlert(false);
  };

  const [successAlert, setSuccessAlert] = useState(false);
  const closeSuccessAlert = () => {
    setSuccessAlert(false);
  };

  const [txHash, setTxHash] = useState("");

  const moveToExp = () => {
    setSuccessAlert(false);
    const url = `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
    window.open(url);
  };

  const onStakeClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    setBackdrop(true);
    try {
      const newStakeAccount = new Keypair();
      let latestBlockhash = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        blockhash: latestBlockhash.blockhash,
        feePayer: publicKey,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: newStakeAccount.publicKey,
          lamports: 10000000,
          space: StakeProgram.space,
          programId: StakeProgram.programId,
        }),
        StakeProgram.initialize({
          stakePubkey: newStakeAccount.publicKey,
          authorized: new Authorized(publicKey, publicKey),
        }),
        StakeProgram.delegate({
          stakePubkey: newStakeAccount.publicKey,
          authorizedPubkey: publicKey,
          votePubkey: new PublicKey(
            "AoaW1RM9BMUPZ1zn1LkCYT2ATWtm7C3YWLQL5pv8wRen"
          ),
        })
      );

      transaction.sign(newStakeAccount);

      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(
        {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          signature: signature,
        },
        "confirmed"
      );

      console.log(signature);
      setTxHash(signature);
      callback();
      setSuccessAlert(true);
      setBackdrop(false);
    } catch (e) {
      setTxHash("");
      console.log(e);
      setErrorAlert(true);
      setBackdrop(false);
    }
  }, [connection, publicKey, sendTransaction, callback]);

  return (
    <div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        open={errorAlert}
        onClose={closeErrorAlert}
        maxWidth={"sm"}
        fullWidth
        style={{
          backgroundColor: "black",
        }}
      >
        <DialogTitle
          id="error-alert-dialog-title"
          style={{ fontFamily: "Oswald, sans-serif", color: "red" }}
        >
          Error!
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ fontFamily: "Oswald, sans-serif" }}>
            Check the Console for logs
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeErrorAlert}
            autoFocus
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={successAlert}
        onClose={closeSuccessAlert}
        maxWidth={"sm"}
        fullWidth
        style={{
          backgroundColor: "black",
        }}
      >
        <DialogTitle
          style={{ fontFamily: "Oswald, sans-serif", color: "green" }}
        >
          Success!
        </DialogTitle>
        <DialogActions>
          <Button
            onClick={closeSuccessAlert}
            autoFocus
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            OK
          </Button>
          <Button
            onClick={moveToExp}
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            VIEW ON SOLANA EXPLORER
          </Button>
        </DialogActions>
      </Dialog>

      <button onClick={onStakeClick} className="my-btn">
        Stake
      </button>
    </div>
  );
};

export default Stake;
