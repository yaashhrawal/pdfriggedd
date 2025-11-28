"use client"

import * as React from "react"
import { PDFDocument } from "pdf-lib"
import { FileUpload } from "@/components/ui/FileUpload"
import { Button } from "@/components/ui/Button"
import { X, Image as ImageIcon } from "lucide-react"

export function ImageToPdfTool() {
    const [files, setFiles] = React.useState<File[]>([])
    const [isConverting, setIsConverting] = React.useState(false)

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles])
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const convertToPDF = async () => {
        if (files.length === 0) return

        setIsConverting(true)
        try {
            const pdfDoc = await PDFDocument.create()

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer()
                const imageBytes = new Uint8Array(arrayBuffer)

                let image
                if (file.type === "image/jpeg" || file.type === "image/jpg") {
                    image = await pdfDoc.embedJpg(imageBytes)
                } else if (file.type === "image/png") {
                    image = await pdfDoc.embedPng(imageBytes)
                } else {
                    continue // Skip unsupported formats
                }

                const page = pdfDoc.addPage([image.width, image.height])
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                })
            }

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "images.pdf"
            link.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error converting images to PDF:", error)
            alert("Failed to convert images. Please try again.")
        } finally {
            setIsConverting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">JPG to PDF</h1>
                <p className="text-xl text-muted-foreground">
                    Convert your images to PDF. Adjust orientation and margins.
                </p>
            </div>

            {files.length === 0 ? (
                <FileUpload
                    onFilesSelected={handleFilesSelected}
                    accept="image/jpeg, image/png, image/jpg"
                    multiple
                    className="h-80"
                />
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="relative p-4 bg-card border rounded-lg shadow-sm flex flex-col items-center group"
                            >
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="p-4 bg-blue-50 rounded-lg mb-3">
                                    <ImageIcon className="w-12 h-12 text-blue-500" />
                                </div>
                                <p className="text-sm font-medium text-center truncate w-full">
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ))}
                        <div className="flex items-center justify-center">
                            <FileUpload
                                onFilesSelected={handleFilesSelected}
                                accept="image/jpeg, image/png, image/jpg"
                                multiple
                                className="h-full min-h-[160px] border-dashed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={convertToPDF}
                            disabled={isConverting || files.length === 0}
                            className="w-full md:w-auto min-w-[200px] text-lg h-14"
                        >
                            {isConverting ? "Converting..." : "Convert to PDF"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
