"use client"

import dynamic from "next/dynamic"

const ScannerTool = dynamic(
    () => import("./ScannerTool").then((mod) => mod.ScannerTool),
    { ssr: false }
)

export function ScannerWrapper() {
    return <ScannerTool />
}
