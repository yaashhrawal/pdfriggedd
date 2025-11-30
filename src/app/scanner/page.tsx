import { ScannerWrapper } from "@/features/scanner/ScannerWrapper"

export const metadata = {
    title: "Document Scanner - PDF Rigged",
    description: "Scan documents with your camera, apply filters, and save as PDF.",
}

export default function ScannerPage() {
    return <ScannerWrapper />
}
