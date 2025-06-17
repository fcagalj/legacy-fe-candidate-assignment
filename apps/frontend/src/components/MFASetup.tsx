import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface MFASetupProps {
  open: boolean;
  onClose: () => void;
  onMFAComplete: () => void;
}

export default function MFASetup({
  open,
  onClose,
  onMFAComplete,
}: MFASetupProps) {
  const { user } = useDynamicContext();
  const [currentStep, setCurrentStep] = useState<"setup" | "verify">("setup");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSetupMFA = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to setup MFA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setCurrentStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/mfa/verify-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      onMFAComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep("setup");
    setQrCode("");
    setSecret("");
    setVerificationCode("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Setup Multi-Factor Authentication</DialogTitle>
      <DialogContent>
        {currentStep === "setup" && (
          <Stack spacing={2}>
            <DialogContentText>
              Enhance your account security by setting up multi-factor
              authentication. You'll need an authenticator app like Google
              Authenticator or Authy.
            </DialogContentText>
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              variant="contained"
              onClick={handleSetupMFA}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Generate QR Code"}
            </Button>
          </Stack>
        )}

        {currentStep === "verify" && (
          <Stack spacing={2}>
            <DialogContentText>
              Scan the QR code with your authenticator app and enter the
              verification code.
            </DialogContentText>

            {qrCode && (
              <Box textAlign="center">
                <img
                  src={qrCode}
                  alt="MFA QR Code"
                  style={{ maxWidth: "200px" }}
                />
                <Typography variant="caption" display="block" mt={1}>
                  Or enter this code manually: {secret}
                </Typography>
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              fullWidth
              inputProps={{ maxLength: 6 }}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {currentStep === "verify" && (
          <Button
            onClick={handleVerifyMFA}
            variant="contained"
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : "Verify & Enable MFA"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
