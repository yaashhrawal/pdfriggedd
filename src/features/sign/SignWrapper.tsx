"use client"

import dynamic from "next/dynamic"

const SignTool = dynamic(() => import("./SignTool").then(mod => mod.SignTool), {
    ssr: false,
    loading: () => <div className="flex justify-center p-10">Loading Signature Tool...</div>
})

export function SignWrapper() {
    return <SignTool />
}
