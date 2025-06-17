import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
} from "@mui/material";
import type { TSignedMessage, TVerificationResultData } from "../utils/types";
import SignedMessageList from "../components/SignedMessageList";
import VerificationResult from "../components/VerificationResult";
import MFASetup from "../components/MFASetup";
import MFAVerification from "../components/MFAVerification";
import { useMFA } from "../hooks/useMFA";

export default function Home() {
  const { setShowAuthFlow, primaryWallet, handleLogOut, user } =
    useDynamicContext();
  const { mfaState, checkMFAStatus } = useMFA();

  const [message, setMessage] = useState<string>("");
  const [signedMessages, setSignedMessages] = useState<TSignedMessage[]>([]);
  const [verificationResult, setVerificationResult] =
    useState<TVerificationResultData | null>(null);

  // MFA related states
  const [showMFASetup, setShowMFASetup] = useState<boolean>(false);
  const [showMFAVerification, setShowMFAVerification] =
    useState<boolean>(false);
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);

  // Check MFA status when user connects
  useEffect(() => {
    if (user?.email) {
      checkMFAStatus();
    }
  }, [user?.email, checkMFAStatus]);

  const handleMessage = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const handleSign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!primaryWallet) return;

    // Check if MFA is required and user hasn't verified yet
    if (mfaState.isEnabled && !mfaState.isVerified) {
      setShowMFAVerification(true);
      setMfaRequired(true);
      return;
    }

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

  const handleMFAComplete = () => {
    checkMFAStatus();
  };

  const handleMFAVerificationSuccess = () => {
    setMfaRequired(false);
    // Continue with the original action if needed
  };

  const handleToggleMFA = () => {
    if (mfaState.isEnabled) {
      // In a real implementation, you'd show a confirmation dialog
      // and call disableMFA from the hook
      console.log("MFA disable would be implemented here");
    } else {
      setShowMFASetup(true);
    }
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

              {/* MFA Security Settings */}
              <Card sx={{ width: "100%", mb: 2 }}>
                <CardHeader title="Security Settings" />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={mfaState.isEnabled}
                        onChange={handleToggleMFA}
                        disabled={mfaState.loading}
                      />
                    }
                    label="Multi-Factor Authentication"
                  />
                  {mfaState.isEnabled && (
                    <Typography
                      variant="caption"
                      color="success.main"
                      display="block"
                    >
                      MFA is enabled for enhanced security
                    </Typography>
                  )}
                  {mfaState.error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {mfaState.error}
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* MFA Required Warning */}
              {mfaRequired && (
                <Alert severity="warning" sx={{ width: "100%" }}>
                  Please complete MFA verification to continue
                </Alert>
              )}

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
                <Button
                  type="submit"
                  variant="contained"
                  disabled={mfaRequired}
                >
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

      {/* MFA Setup Dialog */}
      <MFASetup
        open={showMFASetup}
        onClose={() => setShowMFASetup(false)}
        onMFAComplete={handleMFAComplete}
      />

      {/* MFA Verification Dialog */}
      <MFAVerification
        open={showMFAVerification}
        onClose={() => {
          setShowMFAVerification(false);
          setMfaRequired(false);
        }}
        onMFASuccess={handleMFAVerificationSuccess}
        userEmail={user?.email}
      />
    </Container>
  );
}
