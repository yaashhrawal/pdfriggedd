import { Capacitor } from "@capacitor/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Share } from "@capacitor/share"

export async function downloadFile(blob: Blob, filename: string) {
    console.log("downloadFile called for:", filename, "Size:", blob.size)
    if (Capacitor.isNativePlatform()) {
        try {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = async () => {
                const base64data = reader.result as string
                const savedFile = await Filesystem.writeFile({
                    path: filename,
                    data: base64data,
                    directory: Directory.Documents,
                    recursive: true
                })

                // Share the file so the user can open it or save it elsewhere
                await Share.share({
                    title: 'Share PDF',
                    text: 'Here is your processed PDF',
                    url: savedFile.uri,
                    dialogTitle: 'Share PDF',
                })
            }
        } catch (error) {
            console.error("Error saving file on device:", error)
            alert("Failed to save file on device.")
        }
    } else {
        // Web fallback
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 100)
    }
}
