export type TSignedMessage = {
  id: number;
  message: string;
  signature: string;
  verified: boolean;
};

export type TVerificationResultData = {
  isValid: boolean;
  signer?: string;
  originalMessage?: string;
  error?: string;
};
