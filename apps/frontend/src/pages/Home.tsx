import { useState, type ChangeEvent, type FormEvent } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TSignedMessage, TVerificationResultData } from "../utils/types";
import SignedMessageList from "../components/SignedMessageList";
import VerificationResult from "../components/VerificationResult";

export default function Home() {
  const { setShowAuthFlow, primaryWallet, handleLogOut } = useDynamicContext();

  const [message, setMessage] = useState<string>("");
  const [signedMessages, setSignedMessages] = useState<TSignedMessage[]>([]);
  const [verificationResult, setVerificationResult] =
    useState<TVerificationResultData | null>(null);

  const handleMessage = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const handleSign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!primaryWallet) return;

    const signature = (await primaryWallet.signMessage(message)) || "";

    setSignedMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        message,
        signature,
        verified: false,
      },
    ]);
  };

  return (
    <Container component={Grid} container spacing={4} minHeight="100vh">
      <Grid size={4} py={4}>
        <Stack
          justifyContent="center"
          alignItems="center"
          height="100%"
          spacing={2}
        >
          {primaryWallet ? (
            <>
              <Button variant="outlined" onClick={handleLogOut}>
                Disconnect
              </Button>
              <Typography>Wallet Address: {primaryWallet.address}</Typography>
              <Stack
                component="form"
                alignItems="center"
                spacing={2}
                onSubmit={handleSign}
                width="100%"
              >
                <TextField
                  name="message"
                  label="Message"
                  value={message}
                  onChange={handleMessage}
                  multiline
                  minRows={5}
                  fullWidth
                />
                <Button type="submit" variant="contained">
                  Sign Message
                </Button>
              </Stack>
            </>
          ) : (
            <Button variant="contained" onClick={() => setShowAuthFlow(true)}>
              Connect Wallet
            </Button>
          )}
        </Stack>
      </Grid>
      <Grid size={4} maxHeight="100vh" overflow="auto">
        <SignedMessageList
          signedMessages={signedMessages}
          setSignedMessages={setSignedMessages}
          setVerificationResult={setVerificationResult}
        />
      </Grid>
      <Grid size={4}>
        <VerificationResult result={verificationResult} />
      </Grid>
    </Container>
  );
}
