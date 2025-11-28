"use client"

import * as React from "react"
import { Capacitor } from "@capacitor/core"

interface AdBannerProps {
    className?: string
    slotId: string // AdSense Slot ID
    format?: "auto" | "fluid" | "rectangle"
}

export function AdBanner({ className, slotId, format = "auto" }: AdBannerProps) {
    const isNative = Capacitor.isNativePlatform()
    const adRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (!isNative && adRef.current) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({})
            } catch (e) {
                console.error("AdSense error", e)
            }
        }
    }, [isNative])

    if (isNative) {
        // Native AdMob Placeholder
        // In a real app, you would use @capacitor-community/admob here
        return (
            <div className={`flex items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 ${className}`}>
                [AdMob Banner Placeholder]
            </div>
        )
    }

    return (
        <div className={`ad-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // REPLACE WITH YOUR ID
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    )
}
