import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import {
  DynamicWidget,
  useDynamicContext,
  useIsLoggedIn,
  useMfa,
  useSyncMfaFlow,
} from "@dynamic-labs/sdk-react-core";
import type { MFADevice } from "@dynamic-labs/sdk-api-core";
import {
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import QRCodeUtil from "qrcode";

type MfaRegisterData = {
  uri: string;
  secret: string;
};

const BackupCodesView = ({
  codes,
  onAccept,
}: {
  codes: string[];
  onAccept: () => void;
}) => (
  <Card sx={{ mt: 2 }}>
    <CardHeader title="Backup Recovery Codes" />
    <CardContent>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Store these backup codes in a safe place. You can use them to access
        your account if you lose your authenticator device.
      </Typography>
      <Box sx={{ my: 2 }}>
        {codes.map((code) => (
          <Chip key={code} label={code} variant="outlined" sx={{ m: 0.5 }} />
        ))}
      </Box>
      <Button variant="contained" onClick={onAccept} fullWidth>
        I've Saved My Backup Codes
      </Button>
    </CardContent>
  </Card>
);

const LogIn = () => (
  <Box textAlign="center" py={4}>
    <Typography variant="h6" gutterBottom>
      User not logged in!
    </Typography>
    <DynamicWidget />
  </Box>
);

const QRCodeView = ({
  data,
  onContinue,
}: {
  data: MfaRegisterData;
  onContinue: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    QRCodeUtil.toCanvas(canvasRef.current, data.uri).catch((error) => {
      console.error(error);
    });
  }, [data.uri]);

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Setup Authenticator App" />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Scan this QR code with your authenticator app (Google Authenticator,
          Authy, etc.)
        </Typography>
        <Box textAlign="center" py={2}>
          <canvas ref={canvasRef} style={{ maxWidth: "100%" }}></canvas>
        </Box>
        <Typography variant="caption" display="block" textAlign="center" mb={2}>
          Or enter this code manually: <strong>{data.secret}</strong>
        </Typography>
        <Button variant="contained" onClick={onContinue} fullWidth>
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};

const OTPView = ({ onSubmit }: { onSubmit: (code: string) => void }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    setError("");
    onSubmit(otp);
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Enter Verification Code" />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter the 6-digit code from your authenticator app
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Verification Code"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="123456"
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 6, pattern: "[0-9]*" }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const MfaView = () => {
  const [userDevices, setUserDevices] = useState<MFADevice[]>([]);
  const [mfaRegisterData, setMfaRegisterData] = useState<MfaRegisterData>();
  const [currentView, setCurrentView] = useState<string>("devices");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const isLogged = useIsLoggedIn();
  const {
    addDevice,
    authenticateDevice,
    getUserDevices,
    deleteUserDevice,
    getRecoveryCodes,
    completeAcknowledgement,
  } = useMfa();

  const { userWithMissingInfo, handleLogOut } = useDynamicContext();

  const refreshUserDevices = async () => {
    try {
      const devices = await getUserDevices();
      setUserDevices(devices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get devices");
    }
  };

  useEffect(() => {
    if (isLogged) {
      refreshUserDevices();
    }
  }, [isLogged]);

  useSyncMfaFlow({
    handler: async () => {
      if (userWithMissingInfo?.scope?.includes("requiresAdditionalAuth")) {
        getUserDevices().then(async (devices) => {
          if (devices.length === 0) {
            setError(undefined);
            const { uri, secret } = await addDevice();
            setMfaRegisterData({ secret, uri });
            setCurrentView("qr-code");
          } else {
            setError(undefined);
            setMfaRegisterData(undefined);
            setCurrentView("otp");
          }
        });
      } else {
        getRecoveryCodes().then(setBackupCodes);
        setCurrentView("backup-codes");
      }
    },
  });

  const onAddDevice = async () => {
    try {
      setError(undefined);
      const { uri, secret } = await addDevice();
      setMfaRegisterData({ secret, uri });
      setCurrentView("qr-code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add device");
    }
  };

  const onQRCodeContinue = async () => {
    setError(undefined);
    setMfaRegisterData(undefined);
    setCurrentView("otp");
  };

  const onOtpSubmit = async (code: string) => {
    try {
      await authenticateDevice({ code });
      getRecoveryCodes().then(setBackupCodes);
      setCurrentView("backup-codes");
      refreshUserDevices();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    }
  };

  const deleteDevice = async (deviceId: string, code: string) => {
    try {
      const mfaAuthToken = await authenticateDevice({ code, deviceId });
      await deleteUserDevice(deviceId!, mfaAuthToken!);
      refreshUserDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete device");
    }
  };

  const generateRecoveryCodes = async () => {
    try {
      const codes = await getRecoveryCodes(true);
      setBackupCodes(codes);
      setCurrentView("backup-codes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate codes");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Multi-Factor Authentication</Typography>
          <Button variant="outlined" onClick={handleLogOut}>
            Log Out
          </Button>
        </Box>

        <DynamicWidget />

        {error && (
          <Alert severity="error" onClose={() => setError(undefined)}>
            {error}
          </Alert>
        )}

        {currentView === "devices" && (
          <Card>
            <CardHeader title="MFA Devices" />
            <CardContent>
              {userDevices.length === 0 ? (
                <Typography color="text.secondary" gutterBottom>
                  No MFA devices configured
                </Typography>
              ) : (
                <List>
                  {userDevices.map((device) => (
                    <ListItem key={device.id}>
                      <ListItemText
                        primary={`Device ${device.id}`}
                        secondary={`Added: ${new Date(device.createdAt!).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            const code = prompt(
                              "Enter verification code to delete device:"
                            );
                            if (code) deleteDevice(device.id!, code);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
              <Stack direction="row" spacing={2} mt={2}>
                <Button variant="contained" onClick={onAddDevice}>
                  Add Device
                </Button>
                <Button variant="outlined" onClick={generateRecoveryCodes}>
                  Generate Recovery Codes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {currentView === "qr-code" && mfaRegisterData && (
          <QRCodeView data={mfaRegisterData} onContinue={onQRCodeContinue} />
        )}

        {currentView === "otp" && <OTPView onSubmit={onOtpSubmit} />}

        {currentView === "backup-codes" && (
          <BackupCodesView
            codes={backupCodes}
            onAccept={() => {
              completeAcknowledgement();
              setCurrentView("devices");
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export const HeadlessMfaView: FC = () => {
  const { user, userWithMissingInfo } = useDynamicContext();

  return <Box>{user || userWithMissingInfo ? <MfaView /> : <LogIn />}</Box>;
};

export default HeadlessMfaView;
