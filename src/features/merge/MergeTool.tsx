"use client"

import * as React from "react"
import { PDFDocument } from "pdf-lib"
import { FileUpload } from "@/components/ui/FileUpload"
import { Button } from "@/components/ui/Button"
import { X, FileText } from "lucide-react"
import { downloadFile } from "@/utils/download"

export function MergeTool() {
    const [files, setFiles] = React.useState<File[]>([])
    const [isMerging, setIsMerging] = React.useState(false)

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles((prev) => [...prev, ...newFiles])
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const mergePDFs = async () => {
        if (files.length < 2) return

        setIsMerging(true)
        try {
            const mergedPdf = await PDFDocument.create()

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer()
                const pdf = await PDFDocument.load(arrayBuffer)
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
                copiedPages.forEach((page) => mergedPdf.addPage(page))
            }

            const pdfBytes = await mergedPdf.save()
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
            await downloadFile(blob, "merged.pdf")
        } catch (error) {
            console.error("Error merging PDFs:", error)
            alert("Failed to merge PDFs. Please try again.")
        } finally {
            setIsMerging(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">Merge PDF files</h1>
                <p className="text-xl text-muted-foreground">
                    Combine PDFs in the order you want with the easiest PDF merger available.
                </p>
            </div>

            {files.length === 0 ? (
                <FileUpload
                    onFilesSelected={handleFilesSelected}
                    accept=".pdf"
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
                                <div className="p-4 bg-red-50 rounded-lg mb-3">
                                    <FileText className="w-12 h-12 text-red-500" />
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
                                accept=".pdf"
                                multiple
                                className="h-full min-h-[160px] border-dashed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={mergePDFs}
                            disabled={isMerging || files.length < 2}
                            className="w-full md:w-auto min-w-[200px] text-lg h-14"
                        >
                            {isMerging ? "Merging PDFs..." : "Merge PDF"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
