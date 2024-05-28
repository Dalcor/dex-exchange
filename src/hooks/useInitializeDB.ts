import { useEffect } from "react";

import { db } from "@/db/db";
import { defaultLists } from "@/db/lists";
import { IIFE } from "@/functions/iife";
import { DEX_SUPPORTED_CHAINS, DexChainId } from "@/sdk_hybrid/chains";

export default function useInitializeDB() {
  useEffect(() => {
    IIFE(async () => {
      for (let i = 0; i < DEX_SUPPORTED_CHAINS.length; i++) {
        const defaultList = await db.tokenLists.get(`default-${DEX_SUPPORTED_CHAINS[i]}`);

        if (!defaultList) {
          await db.tokenLists.add({
            id: `default-${DEX_SUPPORTED_CHAINS[i]}`,
            list: defaultLists[DEX_SUPPORTED_CHAINS[i]],
            chainId: DEX_SUPPORTED_CHAINS[i],
            enabled: true,
          });
        } else {
          const { major, minor, patch } = defaultList.list.version;
          const {
            major: _major,
            minor: _minor,
            patch: _patch,
          } = defaultLists[DEX_SUPPORTED_CHAINS[i]].version;
          if (
            major < _major ||
            (major === major && minor < _minor) ||
            (major === _major && minor === _minor && patch < _patch)
          ) {
            await (db.tokenLists as any).update(`default-${DEX_SUPPORTED_CHAINS[i]}`, {
              list: defaultLists[DEX_SUPPORTED_CHAINS[i]],
              enabled: true,
            });
          }
        }
      }
    });
  }, []);
}
