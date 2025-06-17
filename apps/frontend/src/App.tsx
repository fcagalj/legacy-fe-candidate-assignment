import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Home from "./pages/Home";
import { LoadingProvider } from "./contexts/LoadingContext";
import Loading from "./components/Loading";

const projectId = import.meta.env.VITE_DYNAMIC_PROJECT_ID || "";

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: projectId,
        walletConnectors: [EthereumWalletConnectors],
        appName: "Web3 Signature Verifier with MFA",
        appLogoUrl: "/vite.svg",
      }}
    >
      <LoadingProvider>
        <Home />
        <Loading />
      </LoadingProvider>
    </DynamicContextProvider>
  );
}
