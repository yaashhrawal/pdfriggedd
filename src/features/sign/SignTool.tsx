"use client"

import * as React from "react"
import SignatureCanvas from "react-signature-canvas"
import { PDFDocument } from "pdf-lib"
import * as pdfjsLib from "pdfjs-dist"
import { Button } from "@/components/ui/Button"
import { Upload, Download, PenTool, Trash2, Move, X } from "lucide-react"
import { downloadFile } from "@/utils/download"

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

export function SignTool() {
    const [pdfFile, setPdfFile] = React.useState<File | null>(null)
    const [pdfPreview, setPdfPreview] = React.useState<string | null>(null)
    interface PageSignature {
        image: string
        x: number
        y: number
        scale: number
    }

    const [pageSignatures, setPageSignatures] = React.useState<{ [page: number]: PageSignature }>({})
    const [isDragging, setIsDragging] = React.useState(false)

    const [currentPage, setCurrentPage] = React.useState(1)
    const [totalPages, setTotalPages] = React.useState(0)
    const pdfDocProxyRef = React.useRef<any>(null)

    const sigPadRef = React.useRef<SignatureCanvas>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const renderPage = async (pageNumber: number) => {
        const pdf = pdfDocProxyRef.current
        if (!pdf) return

        try {
            const page = await pdf.getPage(pageNumber)
            const viewport = page.getViewport({ scale: 1.5 })
            const canvas = document.createElement("canvas")
            const context = canvas.getContext("2d")
            canvas.height = viewport.height
            canvas.width = viewport.width

            if (context) {
                await page.render({ canvasContext: context, viewport } as any).promise
                setPdfPreview(canvas.toDataURL())
            }
        } catch (error) {
            console.error("Error rendering page:", error)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPdfFile(file)
            try {
                const arrayBuffer = await file.arrayBuffer()
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
                pdfDocProxyRef.current = pdf
                setTotalPages(pdf.numPages)
                setCurrentPage(1)
                await renderPage(1)
            } catch (error) {
                console.error("Error loading PDF:", error)
                alert("Failed to load PDF. Please try another file.")
            }
        }
    }

    const clearSignature = () => {
        setPageSignatures(prev => {
            const newSigs = { ...prev }
            delete newSigs[currentPage]
            return newSigs
        })
        // Optional: Clear the pad if we want, but maybe user wants to redraw
        // sigPadRef.current?.clear() 
    }

    const saveSignature = () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            const image = sigPadRef.current.getTrimmedCanvas().toDataURL("image/png")
            setPageSignatures(prev => ({
                ...prev,
                [currentPage]: {
                    image,
                    x: prev[currentPage]?.x || 50,
                    y: prev[currentPage]?.y || 50,
                    scale: prev[currentPage]?.scale || 1
                }
            }))
        }
    }

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true)
    }

    const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

        const x = ((clientX - containerRect.left) / containerRect.width) * 100
        const y = ((clientY - containerRect.top) / containerRect.height) * 100

        setPageSignatures(prev => ({
            ...prev,
            [currentPage]: {
                ...prev[currentPage],
                x: Math.max(0, Math.min(90, x)),
                y: Math.max(0, Math.min(90, y))
            }
        }))
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const signAndDownload = async () => {
        if (!pdfFile || Object.keys(pageSignatures).length === 0) return

        try {
            const pdfBytes = await pdfFile.arrayBuffer()
            const pdfDoc = await PDFDocument.load(pdfBytes)
            const pages = pdfDoc.getPages()

            for (const [pageNumStr, sigData] of Object.entries(pageSignatures)) {
                const pageNum = parseInt(pageNumStr)
                const targetPage = pages[pageNum - 1]
                if (!targetPage) continue

                const sigImage = await pdfDoc.embedPng(sigData.image)
                const { width, height } = targetPage.getSize()

                const baseSigWidth = 150
                const sigWidth = baseSigWidth * sigData.scale
                const sigHeight = (sigImage.height / sigImage.width) * sigWidth

                const x = (sigData.x / 100) * width
                const y = height - ((sigData.y / 100) * height) - sigHeight

                targetPage.drawImage(sigImage, {
                    x,
                    y,
                    width: sigWidth,
                    height: sigHeight,
                })
            }

            const signedPdfBytes = await pdfDoc.save()
            const blob = new Blob([signedPdfBytes as any], { type: "application/pdf" })
            await downloadFile(blob, `signed-${pdfFile.name}`)
        } catch (error) {
            console.error("Error signing PDF:", error)
            alert("Failed to sign PDF")
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6" onMouseUp={handleDragEnd} onTouchEnd={handleDragEnd}>
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">Sign PDF</h1>
                <p className="text-xl text-muted-foreground">
                    Draw your signature and place it on your PDF document.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column: Upload & Signature Pad */}
                <div className="space-y-6">
                    <div className="p-6 border-2 border-dashed rounded-lg bg-muted/30 text-center">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="font-medium">
                                {pdfFile ? pdfFile.name : "Upload PDF to Sign"}
                            </span>
                        </label>
                    </div>

                    <div className="border rounded-lg p-4 bg-white shadow-sm">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <PenTool className="w-4 h-4" /> Draw Signature
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Draw below to automatically add signature to the current page.
                        </p>
                        <div className="border border-gray-200 rounded bg-white">
                            <SignatureCanvas
                                ref={sigPadRef}
                                canvasProps={{
                                    className: "w-full h-40",
                                    style: { width: '100%', height: '160px' }
                                }}
                                onEnd={saveSignature}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => {
                                                const image = reader.result as string
                                                setPageSignatures(prev => ({
                                                    ...prev,
                                                    [currentPage]: {
                                                        image,
                                                        x: 50,
                                                        y: 50,
                                                        scale: 1
                                                    }
                                                }))
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                />
                                <Button variant="outline" size="sm">
                                    <Upload className="w-4 h-4 mr-2" /> Upload Image
                                </Button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearSignature} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Clear
                            </Button>
                        </div>

                        {pageSignatures[currentPage] && (
                            <div className="mt-4 space-y-2">
                                <label className="text-sm font-medium">Signature Size</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.1"
                                    value={pageSignatures[currentPage].scale}
                                    onChange={(e) => {
                                        const scale = parseFloat(e.target.value)
                                        setPageSignatures(prev => ({
                                            ...prev,
                                            [currentPage]: {
                                                ...prev[currentPage],
                                                scale
                                            }
                                        }))
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {pdfFile && Object.keys(pageSignatures).length > 0 && (
                        <Button onClick={signAndDownload} className="w-full" size="lg">
                            <Download className="w-4 h-4 mr-2" /> Download Signed PDF
                        </Button>
                    )}
                </div>

                {/* Right Column: Preview & Placement */}
                <div className="bg-muted/10 rounded-lg p-4 min-h-[500px] flex items-center justify-center border">
                    {pdfPreview ? (
                        <div className="flex flex-col items-center w-full">
                            <div
                                ref={containerRef}
                                className="relative shadow-lg max-w-full mb-4"
                                style={{ touchAction: "none" }}
                                onMouseMove={handleDrag}
                                onTouchMove={(e) => {
                                    if (isDragging) e.preventDefault()
                                    handleDrag(e)
                                }}
                            >
                                <img src={pdfPreview} alt="PDF Preview" className="max-w-full h-auto" />

                                {pageSignatures[currentPage] && (
                                    <div
                                        className="absolute cursor-move border-2 border-primary border-dashed bg-white/50 p-1 rounded group"
                                        style={{
                                            left: `${pageSignatures[currentPage].x}%`,
                                            top: `${pageSignatures[currentPage].y}%`,
                                            width: `${100 * pageSignatures[currentPage].scale}px`,
                                            transform: 'translate(-50%, -50%)' // Center on cursor
                                        }}
                                        onMouseDown={handleDragStart}
                                        onTouchStart={(e) => {
                                            e.preventDefault() // Prevent scroll start
                                            handleDragStart(e)
                                        }}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                clearSignature()
                                            }}
                                            onTouchEnd={(e) => {
                                                e.stopPropagation()
                                                clearSignature()
                                            }}
                                            className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <img src={pageSignatures[currentPage].image} alt="Signature" className="w-full h-auto" />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
                                            Drag to move
                                        </div>
                                    </div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newPage = Math.max(1, currentPage - 1)
                                            setCurrentPage(newPage)
                                            renderPage(newPage)
                                        }}
                                        disabled={currentPage <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newPage = Math.min(totalPages, currentPage + 1)
                                            setCurrentPage(newPage)
                                            renderPage(newPage)
                                        }}
                                        disabled={currentPage >= totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-muted-foreground text-center">
                            <p>Upload a PDF to see preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
