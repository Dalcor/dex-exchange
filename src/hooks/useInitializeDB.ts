import { useEffect } from "react";

import { db } from "@/db/db";
import { defaultLists } from "@/db/lists";
import { IIFE } from "@/functions/iife";
import { DexChainId } from "@/sdk_hybrid/chains";

const dexChainIds = [DexChainId.CALLISTO, DexChainId.SEPOLIA];
export default function useInitializeDB() {
  useEffect(() => {
    IIFE(async () => {
      for (let i = 0; i < dexChainIds.length; i++) {
        const defaultList = await db.tokenLists.get(`default-${dexChainIds[i]}`);

        if (!defaultList) {
          await db.tokenLists.add({
            id: `default-${dexChainIds[i]}`,
            list: defaultLists[dexChainIds[i]],
            chainId: dexChainIds[i],
            enabled: true,
          });
        } else {
          const { major, minor, patch } = defaultList.list.version;
          const {
            major: _major,
            minor: _minor,
            patch: _patch,
          } = defaultLists[dexChainIds[i]].version;
          if (
            major < _major ||
            (major === major && minor < _minor) ||
            (major === _major && minor === _minor && patch < _patch)
          ) {
            await (db.tokenLists as any).update(`default-${dexChainIds[i]}`, {
              list: defaultLists[dexChainIds[i]],
              enabled: true,
            });
          }
        }
      }
    });
  }, []);
}
