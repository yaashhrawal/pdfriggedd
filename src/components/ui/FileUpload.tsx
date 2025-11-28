import * as React from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void
    accept?: string
    multiple?: boolean
    className?: string
}

export function FileUpload({ onFilesSelected, accept, multiple = false, className }: FileUploadProps) {
    const [isDragging, setIsDragging] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files))
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files))
        }
    }

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={handleFileInput}
            />
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="mb-2 text-xl font-semibold text-foreground">
                    Select PDF files
                </p>
                <p className="text-sm text-muted-foreground">
                    or drop PDFs here
                </p>
            </div>
        </div>
    )
}
