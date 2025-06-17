import { useState, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface MFAState {
  isEnabled: boolean;
  isRequired: boolean;
  isVerified: boolean;
  loading: boolean;
  error: string | null;
}

export const useMFA = () => {
  const { user } = useDynamicContext();
  const [mfaState, setMFAState] = useState<MFAState>({
    isEnabled: false,
    isRequired: false,
    isVerified: false,
    loading: false,
    error: null,
  });

  const checkMFAStatus = useCallback(async () => {
    if (!user?.email) return;

    setMFAState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/mfa/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check MFA status");
      }

      const data = await response.json();
      setMFAState((prev) => ({
        ...prev,
        isEnabled: data.isEnabled,
        isRequired: data.isRequired,
        isVerified: data.isVerified,
        loading: false,
      }));
    } catch (error) {
      setMFAState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, [user?.email]);

  const setupMFA = useCallback(async () => {
    if (!user?.email) return null;

    setMFAState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to setup MFA");
      }

      const data = await response.json();
      setMFAState((prev) => ({ ...prev, loading: false }));
      return data;
    } catch (error) {
      setMFAState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Setup failed",
        loading: false,
      }));
      return null;
    }
  }, [user?.email]);

  const verifyMFASetup = useCallback(
    async (code: string) => {
      if (!user?.email) return false;

      setMFAState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/mfa/verify-setup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            code,
          }),
        });

        if (!response.ok) {
          throw new Error("Invalid verification code");
        }

        setMFAState((prev) => ({
          ...prev,
          isEnabled: true,
          loading: false,
        }));
        return true;
      } catch (error) {
        setMFAState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Verification failed",
          loading: false,
        }));
        return false;
      }
    },
    [user?.email]
  );

  const verifyMFA = useCallback(
    async (code: string) => {
      if (!user?.email) return false;

      setMFAState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/mfa/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            code,
          }),
        });

        if (!response.ok) {
          throw new Error("Invalid verification code");
        }

        const data = await response.json();

        // Store the MFA-verified token
        localStorage.setItem("mfa_verified_token", data.token);

        setMFAState((prev) => ({
          ...prev,
          isVerified: true,
          loading: false,
        }));
        return true;
      } catch (error) {
        setMFAState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Verification failed",
          loading: false,
        }));
        return false;
      }
    },
    [user?.email]
  );

  const disableMFA = useCallback(
    async (code: string) => {
      if (!user?.email) return false;

      setMFAState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/mfa/disable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            code,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to disable MFA");
        }

        setMFAState((prev) => ({
          ...prev,
          isEnabled: false,
          isVerified: false,
          loading: false,
        }));

        // Remove the MFA token
        localStorage.removeItem("mfa_verified_token");

        return true;
      } catch (error) {
        setMFAState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to disable MFA",
          loading: false,
        }));
        return false;
      }
    },
    [user?.email]
  );

  const clearError = useCallback(() => {
    setMFAState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    mfaState,
    checkMFAStatus,
    setupMFA,
    verifyMFASetup,
    verifyMFA,
    disableMFA,
    clearError,
  };
};
