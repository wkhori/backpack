import { Suspense } from "react";
import type { Plugin } from "@coral-xyz/common";
import { Loading, MoreIcon, PowerIcon } from "@coral-xyz/react-common";
import {
  transactionRequest,
  useActiveSolanaWallet,
  useBackgroundClient,
  useConnectionBackgroundClient,
  useFreshPlugin,
  useNavigationSegue,
  useOpenPlugin,
  usePlugins,
  xnftPreference as xnftPreferenceAtom,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Button, Divider } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { PluginRenderer } from "../../../plugin/Renderer";

import { Simulator } from "./Simulator";

export function PluginApp({
  xnftAddress,
  closePlugin,
}: {
  xnftAddress?: string;
  closePlugin: () => void;
}) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: theme.custom.colors.background,
      }}
    >
      <PluginControl closePlugin={closePlugin} />
      <Suspense fallback={<Loading />}>
        <LoadPlugin xnftAddress={xnftAddress} />
      </Suspense>
    </div>
  );
}

export function LoadPlugin({ xnftAddress }: { xnftAddress?: string }) {
  const { publicKey } = useActiveSolanaWallet(); // TODO: aggregate wallet considerations.
  const plugins = usePlugins(publicKey);
  const segue = useNavigationSegue();
  const setTransactionRequest = useSetRecoilState(transactionRequest);
  const backgroundClient = useBackgroundClient();
  const connectionBackgroundClient = useConnectionBackgroundClient();
  const openPlugin = useOpenPlugin();

  if (!plugins || !xnftAddress) {
    return <Loading />;
  }

  const plugin = plugins?.find((p) => p.xnftAddress.toString() === xnftAddress);

  if (!plugin) {
    return <DisplayFreshPlugin xnftAddress={xnftAddress} />;
  }
  plugin.setHostApi({
    push: segue.push,
    pop: segue.pop,
    request: setTransactionRequest,
    backgroundClient,
    connectionBackgroundClient,
    openPlugin,
  });

  if (xnftAddress === PublicKey.default.toString()) {
    return <Simulator plugin={plugin} />;
  }
  return <PluginDisplay plugin={plugin} />;
}

function DisplayFreshPlugin({ xnftAddress }: { xnftAddress: string }) {
  const p = useFreshPlugin(xnftAddress);
  if (!p.result) {
    return null;
  }
  return <PluginDisplay plugin={p.result} />;
}

export function PluginDisplay({ plugin }: { plugin?: Plugin }) {
  const xnftPreference = useRecoilValue(
    xnftPreferenceAtom(plugin?.xnftInstallAddress?.toString())
  );

  if (!plugin) {
    return null;
  }

  // TODO: splash loading page.
  return (
    <PluginRenderer
      key={plugin.iframeRootUrl}
      plugin={plugin}
      xnftPreference={xnftPreference}
    />
  );
}

function PluginControl({ closePlugin }: any) {
  return (
    <div
      style={{
        position: "fixed",
        height: "36px",
        right: 16,
        top: 10,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "87px",
          height: "32px",
          borderRadius: "18.5px",
          display: "flex",
          background: "#fff",
        }}
      >
        <Button
          disableRipple
          onClick={() => {}}
          style={{
            flex: 1,
            height: "32px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "41.67px",
          }}
        >
          <MoreIcon fill={"#000000"} />
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Divider
            orientation="vertical"
            style={{
              width: "0.5px",
              height: "20px",
              backgroundColor: "#E9E9E9",
            }}
          />
        </div>
        <Button
          disableRipple
          onClick={() => closePlugin()}
          style={{
            flex: 1,
            height: "32px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "41.67px",
          }}
        >
          <PowerIcon fill={"#000000"} />
        </Button>
      </div>
    </div>
  );
}
