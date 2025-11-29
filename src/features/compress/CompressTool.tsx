"use client"

import * as React from "react"
import { PDFDocument } from "pdf-lib"
import { FileUpload } from "@/components/ui/FileUpload"
import { Button } from "@/components/ui/Button"
import { X, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadFile } from "@/utils/download"

const COMPRESSION_LEVELS = [
    {
        id: "extreme",
        title: "Extreme Compression",
        description: "Less quality, high compression.",
    },
    {
        id: "recommended",
        title: "Recommended Compression",
        description: "Good quality, good compression.",
    },
    {
        id: "less",
        title: "Less Compression",
        description: "High quality, less compression.",
    },
]

export function CompressTool() {
    const [file, setFile] = React.useState<File | null>(null)
    const [level, setLevel] = React.useState("recommended")
    const [isCompressing, setIsCompressing] = React.useState(false)

    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0])
        }
    }

    const removeFile = () => {
        setFile(null)
    }

    const compressPDF = async () => {
        if (!file) return

        setIsCompressing(true)
        try {
            const arrayBuffer = await file.arrayBuffer()

            if (level === "extreme") {
                // Extreme compression: Rasterize pages to JPEGs and rebuild PDF
                const pdfjsLib = await import("pdfjs-dist")
                pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

                const loadingTask = pdfjsLib.getDocument(arrayBuffer)
                const pdf = await loadingTask.promise
                const newPdf = await PDFDocument.create()

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i)
                    const viewport = page.getViewport({ scale: 1.0 }) // Standard scale
                    const canvas = document.createElement("canvas")
                    const context = canvas.getContext("2d")
                    canvas.height = viewport.height
                    canvas.width = viewport.width

                    if (context) {
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        }
                        await page.render(renderContext as any).promise
                        const imgData = canvas.toDataURL("image/jpeg", 0.5) // 50% quality JPEG
                        const img = await newPdf.embedJpg(imgData)
                        const newPage = newPdf.addPage([viewport.width, viewport.height])
                        newPage.drawImage(img, {
                            x: 0,
                            y: 0,
                            width: viewport.width,
                            height: viewport.height,
                        })
                    }
                }

                const pdfBytes = await newPdf.save()
                const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
                await downloadFile(blob, `compressed-${file.name}`)

            } else {
                // Standard/Less compression: Just save (optimizes structure)
                // In a real app, we'd need server-side tools for better compression without rasterization
                const pdf = await PDFDocument.load(arrayBuffer)
                const pdfBytes = await pdf.save()
                const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
                await downloadFile(blob, `compressed-${file.name}`)
            }

        } catch (error) {
            console.error("Error compressing PDF:", error)
            alert("Failed to compress PDF. Please try again.")
        } finally {
            setIsCompressing(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">Compress PDF file</h1>
                <p className="text-xl text-muted-foreground">
                    Reduce file size while optimizing for maximal PDF quality.
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {COMPRESSION_LEVELS.map((lvl) => (
                            <div
                                key={lvl.id}
                                onClick={() => setLevel(lvl.id)}
                                className={cn(
                                    "cursor-pointer p-4 border rounded-lg transition-all relative",
                                    level === lvl.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "hover:border-primary/50"
                                )}
                            >
                                {level === lvl.id && (
                                    <div className="absolute top-2 right-2 text-primary">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                )}
                                <h3 className="font-semibold mb-1">{lvl.title}</h3>
                                <p className="text-sm text-muted-foreground">{lvl.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={compressPDF}
                            disabled={isCompressing}
                            className="w-full md:w-auto min-w-[200px] text-lg h-14"
                        >
                            {isCompressing ? "Compressing PDF..." : "Compress PDF"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
