import { Alert, Stack, Typography } from "@mui/material";
import type { TVerificationResultData } from "../utils/types";

export default function VerificationResult({
  result,
}: {
  result: TVerificationResultData | null;
}) {
  if (!result) return null;
  return (
    <Stack height="100%" justifyContent="center" spacing={2}>
      <Alert severity={result.isValid ? "success" : "error"}>
        {result.isValid ? "Signature is valid!" : "Invalid signature!"}
      </Alert>
      <Typography>Original Message: {result.originalMessage}</Typography>
      {result.isValid && (
        <Typography>Signer Address: {result.signer}</Typography>
      )}
    </Stack>
  );
}
