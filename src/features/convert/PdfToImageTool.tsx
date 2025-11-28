"use client"

import * as React from "react"
import { FileUpload } from "@/components/ui/FileUpload"
import { Button } from "@/components/ui/Button"
import { X, FileText } from "lucide-react"

export function PdfToImageTool() {
    const [file, setFile] = React.useState<File | null>(null)
    const [isConverting, setIsConverting] = React.useState(false)

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0])
        }
    }

    const removeFile = () => {
        setFile(null)
    }

    const convertToJPG = async () => {
        if (!file) return

        setIsConverting(true)
        try {
            const pdfjsLib = await import("pdfjs-dist")
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

            const arrayBuffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
            const totalPages = pdf.numPages

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdf.getPage(i)
                const viewport = page.getViewport({ scale: 2 }) // High quality
                const canvas = document.createElement("canvas")
                const context = canvas.getContext("2d")
                canvas.height = viewport.height
                canvas.width = viewport.width

                if (context) {
                    await page.render({ canvasContext: context, viewport } as any).promise

                    const blob = await new Promise<Blob | null>((resolve) =>
                        canvas.toBlob(resolve, "image/jpeg", 0.9)
                    )

                    if (blob) {
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement("a")
                        link.href = url
                        link.download = `${file.name.replace(".pdf", "")}-page-${i}.jpg`
                        link.click()
                        URL.revokeObjectURL(url)
                    }
                }
            }

        } catch (error) {
            console.error("Error converting PDF to JPG:", error)
            alert("Failed to convert PDF. Please try again.")
        } finally {
            setIsConverting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">PDF to JPG</h1>
                <p className="text-xl text-muted-foreground">
                    Convert each PDF page into a JPG or extract all images contained in a PDF.
                </p>
            </div>

            {!file ? (
                <FileUpload
                    onFilesSelected={handleFilesSelected}
                    accept=".pdf"
                    className="h-80"
                />
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-center">
                        <div className="relative p-6 bg-card border rounded-lg shadow-sm flex flex-col items-center group w-64">
                            <button
                                onClick={removeFile}
                                className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="p-4 bg-red-50 rounded-lg mb-3">
                                <FileText className="w-16 h-16 text-red-500" />
                            </div>
                            <p className="text-sm font-medium text-center truncate w-full">
                                {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={convertToJPG}
                            disabled={isConverting}
                            className="w-full md:w-auto min-w-[200px] text-lg h-14"
                        >
                            {isConverting ? "Converting..." : "Convert to JPG"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
