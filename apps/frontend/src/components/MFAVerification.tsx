import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

interface MFAVerificationProps {
  open: boolean;
  onClose: () => void;
  onMFASuccess: () => void;
  userEmail?: string;
}

export default function MFAVerification({
  open,
  onClose,
  onMFASuccess,
  userEmail,
}: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerifyMFA = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mfa/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            code: verificationCode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid verification code");
      }

      const data = await response.json();

      // Store the MFA-verified token
      localStorage.setItem("mfa_verified_token", data.token);

      onMFASuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVerificationCode("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Multi-Factor Authentication Required</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>
            Please enter the 6-digit code from your authenticator app to
            complete the login process.
          </DialogContentText>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Authentication Code"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, ""))
            }
            placeholder="000000"
            fullWidth
            inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleVerifyMFA}
          variant="contained"
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? <CircularProgress size={24} /> : "Verify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
