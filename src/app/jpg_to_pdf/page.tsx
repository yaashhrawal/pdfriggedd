import { ImageToPdfTool } from "@/features/convert/ImageToPdfTool"

export const metadata = {
    title: "JPG to PDF - PDF Rigged",
    description: "Convert your images to PDF. Adjust orientation and margins.",
}

export default function JpgToPdfPage() {
    return <ImageToPdfTool />
}
