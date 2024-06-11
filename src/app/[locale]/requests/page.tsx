"use client";

import { useEffect } from "react";
import { useBlockNumber, useWatchBlocks } from "wagmi";

export default function DebugRequestsPage() {
  // const { data: blockNumber } = useBlockNumber({ watch: true });
  //
  // useEffect(() => {
  //   console.log(blockNumber);
  // }, [blockNumber]);

  // useWatchBlocks({
  //   onBlock(block) {
  //     console.log("New block", block.number);
  //   },
  // });

  return <div>Loading...</div>;
}
