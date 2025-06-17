import { useState, type ChangeEvent, type FormEvent } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
  Tab,
  Tabs,
  Box,
} from "@mui/material";
import type { TSignedMessage, TVerificationResultData } from "../utils/types";
import SignedMessageList from "../components/SignedMessageList";
import VerificationResult from "../components/VerificationResult";
import HeadlessMfaView from "../components/HeadlessMfaView";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [signedMessages, setSignedMessages] = useState<TSignedMessage[]>([]);
  const [verificationResult, setVerificationResult] =
    useState<TVerificationResultData | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
    <Container maxWidth="xl" sx={{ minHeight: "100vh", py: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="app tabs">
          <Tab
            label="Signature Verifier"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab label="MFA Settings" id="tab-1" aria-controls="tabpanel-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4} minHeight="80vh">
          <Grid size={4}>
            <Stack
              justifyContent="center"
              alignItems="center"
              height="100%"
              spacing={2}
            >
              {primaryWallet ? (
                <Stack
                  component="form"
                  alignItems="center"
                  spacing={2}
                  onSubmit={handleSign}
                  width="100%"
                >
                  <Typography>
                    Wallet Address: {primaryWallet.address}
                  </Typography>
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
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setShowAuthFlow(true)}
                >
                  Connect Wallet
                </Button>
              )}
            </Stack>
          </Grid>
          <Grid size={4}>
            <SignedMessageList
              signedMessages={signedMessages}
              setSignedMessages={setSignedMessages}
              setVerificationResult={setVerificationResult}
            />
          </Grid>
          <Grid size={4}>
            <VerificationResult result={verificationResult} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <HeadlessMfaView />
      </TabPanel>
    </Container>
  );
}
