import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import "../Styles.css";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";

const Transfer: FC<{callback: () => void}> = ({callback}) => {
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

  const onTransferClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    setBackdrop(true);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports: 1000000,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();

      await connection.confirmTransaction(
        {
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          signature: signature,
        },
        "processed"
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
  }, [publicKey, sendTransaction, connection, callback]);

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

      <button onClick={onTransferClick} className="my-btn">
        Transfer
      </button>
    </div>
  );
};

export default Transfer;
