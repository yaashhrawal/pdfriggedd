import { PdfToImageTool } from "@/features/convert/PdfToImageTool"

export const metadata = {
    title: "PDF to JPG - PDF Rigged",
    description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
}

export default function PdfToJpgPage() {
    return <PdfToImageTool />
}
