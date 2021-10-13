import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChainId, DAppProvider, Config } from "@usedapp/core";

const cfg: Config = {
  readOnlyChainId: ChainId.Mainnet,
};

function App({ Component, pageProps }: AppProps) {
  return (
    <DAppProvider config={cfg}>
      <Component {...pageProps} />
    </DAppProvider>
  );
}

export default App;
