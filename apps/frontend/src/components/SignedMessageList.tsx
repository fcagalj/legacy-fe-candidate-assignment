import { type Dispatch, type SetStateAction } from "react";
import axios from "axios";
import { Button, List, ListItem, Typography } from "@mui/material";
import type { TSignedMessage, TVerificationResultData } from "../utils/types";
import useLoading from "../hooks/useLoading";

export default function SignedMessageList({
  signedMessages,
  setSignedMessages,
  setVerificationResult,
}: {
  signedMessages: TSignedMessage[];
  setSignedMessages: Dispatch<SetStateAction<TSignedMessage[]>>;
  setVerificationResult: Dispatch<
    SetStateAction<TVerificationResultData | null>
  >;
}) {
  const { setLoadingAct } = useLoading();

  const verifySignature = async (
    id: number,
    message: string,
    signature: string
  ) => {
    setLoadingAct(true);
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/verify-signature`,
      { message, signature }
    );
    const { isValid, signer, originalMessage, error } = res.data;

    setSignedMessages((prev) => {
      const prevSignedMessages = [...prev];
      const index = prevSignedMessages.findIndex((psm) => psm.id === id);
      prevSignedMessages.splice(index, 1, {
        id,
        message,
        signature,
        verified: isValid,
      });
      return prevSignedMessages;
    });
    setVerificationResult({
      isValid: isValid,
      signer: signer,
      originalMessage: originalMessage,
      error: error || "",
    });
    setLoadingAct(false);
  };

  return (
    <List>
      {signedMessages.map((sMessage) => (
        <ListItem key={sMessage.id}>
          <Typography sx={{ flexGrow: 1 }}>{sMessage.message}</Typography>
          {sMessage.verified ? (
            <Button variant="contained" disabled>
              Verified
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() =>
                verifySignature(
                  sMessage.id,
                  sMessage.message,
                  sMessage.signature
                )
              }
            >
              Verify
            </Button>
          )}
        </ListItem>
      ))}
    </List>
  );
}
