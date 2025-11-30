"use client"

import * as React from "react"
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera"
import { Button } from "@/components/ui/Button"
import { Camera, Upload, Download, RefreshCw, Image as ImageIcon, Wand2, Check, X } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { downloadFile } from "@/utils/download"
import { motion, AnimatePresence } from "framer-motion"

export interface ScannedPage {
    id: string
    original: string
    cropped: string | null
    filter: "original" | "grayscale" | "bw" | "magic"
    crop?: Crop
    completedCrop?: PixelCrop
}

export function ScannerTool() {
    const [pages, setPages] = React.useState<ScannedPage[]>([])
    const [activePageId, setActivePageId] = React.useState<string | null>(null)
    const imgRef = React.useRef<HTMLImageElement>(null)

    const activePage = React.useMemo(() =>
        pages.find(p => p.id === activePageId),
        [pages, activePageId])

    const addPage = (imageSrc: string) => {
        const newPage: ScannedPage = {
            id: crypto.randomUUID(),
            original: imageSrc,
            cropped: null,
            filter: "original",
            crop: { unit: '%', width: 90, height: 90, x: 5, y: 5 }
        }
        setPages(prev => [...prev, newPage])
        setActivePageId(newPage.id)
    }

    const capture = async () => {
        try {
            const image = await CapCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            })
            if (image.dataUrl) {
                addPage(image.dataUrl)
            }
        } catch (error) {
            console.error("Camera error:", error)
            // Ignore error if user cancelled
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                addPage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const updateActivePage = (updates: Partial<ScannedPage>) => {
        if (!activePageId) return
        setPages(prev => prev.map(p => p.id === activePageId ? { ...p, ...updates } : p))
    }

    const deleteActivePage = () => {
        if (!activePageId) return
        setPages(prev => {
            const newPages = prev.filter(p => p.id !== activePageId)
            if (newPages.length > 0) {
                setActivePageId(newPages[newPages.length - 1].id)
            } else {
                setActivePageId(null)
            }
            return newPages
        })
    }

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        // Initial crop is set activePage creation, but we can adjust if needed
    }

    const generateCroppedImage = async () => {
        if (activePage?.completedCrop && imgRef.current) {
            const canvas = document.createElement('canvas')
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height
            canvas.width = activePage.completedCrop.width * scaleX
            canvas.height = activePage.completedCrop.height * scaleY
            const ctx = canvas.getContext('2d')

            if (ctx) {
                ctx.drawImage(
                    imgRef.current,
                    activePage.completedCrop.x * scaleX,
                    activePage.completedCrop.y * scaleY,
                    activePage.completedCrop.width * scaleX,
                    activePage.completedCrop.height * scaleY,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
                updateActivePage({
                    cropped: canvas.toDataURL('image/jpeg'),
                    filter: "magic"
                })
            }
        } else if (activePage) {
            updateActivePage({
                cropped: activePage.original,
                filter: "magic"
            })
        }
    }

    const applyFilter = async (src: string, filterType: "original" | "grayscale" | "bw" | "magic"): Promise<string> => {
        if (filterType === "original") return src

        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext("2d")
                if (!ctx) return resolve(src)

                ctx.drawImage(img, 0, 0)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i]
                    const g = data[i + 1]
                    const b = data[i + 2]

                    if (filterType === "grayscale") {
                        const gray = 0.3 * r + 0.59 * g + 0.11 * b
                        data[i] = gray
                        data[i + 1] = gray
                        data[i + 2] = gray
                    } else if (filterType === "bw") {
                        const gray = 0.3 * r + 0.59 * g + 0.11 * b
                        const val = gray > 128 ? 255 : 0
                        data[i] = val
                        data[i + 1] = val
                        data[i + 2] = val
                    } else if (filterType === "magic") {
                        // Magic Scan: High contrast, brightness boost, sharpening feel
                        const gray = 0.3 * r + 0.59 * g + 0.11 * b
                        // Simple adaptive-like thresholding logic (contrast stretch)
                        let val = (gray - 50) * 1.5 // Increase contrast
                        val = val + 30 // Increase brightness
                        val = Math.min(255, Math.max(0, val)) // Clamp

                        data[i] = val
                        data[i + 1] = val
                        data[i + 2] = val
                    }
                }

                ctx.putImageData(imageData, 0, 0)
                resolve(canvas.toDataURL("image/jpeg"))
            }
            img.src = src
        })
    }

    const saveAsPdf = async () => {
        if (pages.length === 0) return

        try {
            const pdfDoc = await PDFDocument.create()

            for (const pageData of pages) {
                const sourceImage = pageData.cropped || pageData.original
                const processedImage = await applyFilter(sourceImage, pageData.filter)

                const page = pdfDoc.addPage()
                const img = await pdfDoc.embedJpg(processedImage)
                const { width, height } = img.scaleToFit(page.getWidth(), page.getHeight())

                page.drawImage(img, {
                    x: page.getWidth() / 2 - width / 2,
                    y: page.getHeight() / 2 - height / 2,
                    width,
                    height,
                })
            }

            const pdfBytes = await pdfDoc.save()
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
            await downloadFile(blob, "scanned-document.pdf")
        } catch (error) {
            console.error("Error saving PDF:", error)
            alert("Failed to save PDF.")
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6"
        >
            <div className="space-y-8">
                {pages.length === 0 ? (
                    // Upload UI ...
                    <div className="glass-card flex flex-col items-center gap-6 p-10">
                        <div className="flex gap-4 flex-wrap justify-center">
                            <Button size="lg" onClick={capture} className="h-32 w-48 flex-col gap-4 text-lg shadow-xl hover:shadow-2xl transition-all">
                                <Camera className="w-10 h-10 icon-3d" />
                                <span>Use Camera</span>
                            </Button>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Button size="lg" variant="glass" className="h-32 w-48 flex-col gap-4 text-lg">
                                    <Upload className="w-10 h-10 icon-3d" />
                                    <span>Upload Image</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* Main Editor Area */}
                        <AnimatePresence mode="wait">
                            {activePage && (
                                <motion.div
                                    key={activePage.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="glass-card p-6"
                                >
                                    {!activePage.cropped ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="max-w-full overflow-auto rounded-lg bg-muted border border-border">
                                                <ReactCrop
                                                    crop={activePage.crop}
                                                    onChange={c => updateActivePage({ crop: c })}
                                                    onComplete={c => updateActivePage({ completedCrop: c })}
                                                >
                                                    <img ref={imgRef} src={activePage.original} onLoad={onImageLoad} alt="Crop me" className="max-w-full max-h-[60vh] object-contain" />
                                                </ReactCrop>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button onClick={deleteActivePage} variant="destructive">
                                                    <X className="w-4 h-4 mr-2 icon-3d" /> Delete Page
                                                </Button>
                                                <Button onClick={generateCroppedImage}>
                                                    <Check className="w-4 h-4 mr-2 icon-3d" /> Confirm Crop
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1 rounded-lg p-4 flex items-center justify-center min-h-[400px] bg-muted border border-border">
                                                <motion.img
                                                    layoutId={`image-${activePage.id}`}
                                                    src={activePage.cropped}
                                                    alt="Scanned document"
                                                    className="max-w-full max-h-[60vh] shadow-2xl object-contain rounded-md"
                                                    style={{
                                                        filter: activePage.filter === "grayscale" ? "grayscale(100%)" :
                                                            activePage.filter === "bw" ? "grayscale(100%) contrast(200%)" :
                                                                activePage.filter === "magic" ? "contrast(120%) brightness(110%) saturate(0%)" : "none"
                                                    }}
                                                />
                                            </div>

                                            <div className="w-full md:w-64 space-y-6">
                                                <div className="space-y-4">
                                                    <h3 className="font-medium text-lg">Filters</h3>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {["magic", "original", "grayscale", "bw"].map((f) => (
                                                            <Button
                                                                key={f}
                                                                variant={activePage.filter === f ? "default" : "glass"}
                                                                onClick={() => updateActivePage({ filter: f as any })}
                                                                className="justify-start capitalize h-12"
                                                            >
                                                                {f === "magic" && <Wand2 className="w-4 h-4 mr-2 icon-3d" />}
                                                                {f === "original" && <ImageIcon className="w-4 h-4 mr-2 icon-3d" />}
                                                                {f === "grayscale" && <div className="w-4 h-4 mr-2 rounded-full bg-gray-400" />}
                                                                {f === "bw" && <div className="w-4 h-4 mr-2 rounded-full bg-black border border-white" />}
                                                                {f}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-border space-y-3">
                                                    <Button
                                                        variant="glass"
                                                        onClick={() => updateActivePage({ cropped: null })}
                                                        className="w-full"
                                                    >
                                                        <RefreshCw className="w-4 h-4 mr-2 icon-3d" /> Re-Crop
                                                    </Button>
                                                    <Button onClick={deleteActivePage} variant="destructive" className="w-full">
                                                        <X className="w-4 h-4 mr-2 icon-3d" /> Delete Page
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Thumbnails & Add Page */}
                        <motion.div layout className="glass-card p-4 flex gap-4 overflow-x-auto">
                            <div className="flex-shrink-0 flex flex-col gap-2">
                                <Button size="icon" onClick={capture} className="h-20 w-20 rounded-xl shadow-md hover:shadow-lg transition-all">
                                    <Camera className="w-6 h-6 icon-3d" />
                                </Button>
                                <div className="relative h-20 w-20">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <Button size="icon" variant="glass" className="h-full w-full rounded-xl border-2 border-dashed border-border">
                                        <Upload className="w-6 h-6 icon-3d" />
                                    </Button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {pages.map((page, index) => (
                                    <motion.div
                                        key={page.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setActivePageId(page.id)}
                                        className={`relative h-44 w-32 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-md transition-all ${activePageId === page.id ? 'ring-4 ring-primary ring-offset-2 ring-offset-transparent' : 'hover:ring-2 hover:ring-white/50'}`}
                                    >
                                        <img
                                            src={page.cropped || page.original}
                                            className="h-full w-full object-cover"
                                            style={{
                                                filter: page.filter === "grayscale" ? "grayscale(100%)" :
                                                    page.filter === "bw" ? "grayscale(100%) contrast(200%)" :
                                                        page.filter === "magic" ? "contrast(120%) brightness(110%) saturate(0%)" : "none"
                                            }}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs p-2 text-center font-medium">
                                            Page {index + 1}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        <Button onClick={saveAsPdf} className="w-full h-14 text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all" size="lg">
                            <Download className="w-5 h-5 mr-2 icon-3d" /> Save All as PDF ({pages.length} pages)
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
