"use client"

import * as React from "react"
import { PDFDocument } from "pdf-lib"
import { FileUpload } from "@/components/ui/FileUpload"
import { Button } from "@/components/ui/Button"
import { X, FileText } from "lucide-react"

export function SplitTool() {
    const [file, setFile] = React.useState<File | null>(null)
    const [range, setRange] = React.useState("")
    const [isSplitting, setIsSplitting] = React.useState(false)

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0])
        }
    }

    const removeFile = () => {
        setFile(null)
        setRange("")
    }

    const splitPDF = async () => {
        if (!file || !range) return

        setIsSplitting(true)
        try {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await PDFDocument.load(arrayBuffer)
            const totalPages = pdf.getPageCount()

            // Parse range string (e.g., "1-3, 5")
            const pageIndices = new Set<number>()
            const parts = range.split(",").map(p => p.trim())

            for (const part of parts) {
                if (part.includes("-")) {
                    const [start, end] = part.split("-").map(Number)
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) {
                            if (i >= 1 && i <= totalPages) {
                                pageIndices.add(i - 1) // 0-indexed
                            }
                        }
                    }
                } else {
                    const pageNum = Number(part)
                    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                        pageIndices.add(pageNum - 1)
                    }
                }
            }

            if (pageIndices.size === 0) {
                alert("Invalid page range.")
                setIsSplitting(false)
                return
            }

            const newPdf = await PDFDocument.create()
            const copiedPages = await newPdf.copyPages(pdf, Array.from(pageIndices))
            copiedPages.forEach((page) => newPdf.addPage(page))

            const pdfBytes = await newPdf.save()
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `split-${file.name}`
            link.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error splitting PDF:", error)
            alert("Failed to split PDF. Please try again.")
        } finally {
            setIsSplitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">Split PDF file</h1>
                <p className="text-xl text-muted-foreground">
                    Separate one page or a whole set for easy conversion into independent PDF files.
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

                    <div className="max-w-md mx-auto space-y-4">
                        <div>
                            <label htmlFor="range" className="block text-sm font-medium mb-1">
                                Page Range (e.g., 1-5, 8, 11-13)
                            </label>
                            <input
                                id="range"
                                type="text"
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="1-5, 8"
                            />
                        </div>
                        <Button
                            size="lg"
                            onClick={splitPDF}
                            disabled={isSplitting || !range}
                            className="w-full text-lg h-14"
                        >
                            {isSplitting ? "Splitting PDF..." : "Split PDF"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
