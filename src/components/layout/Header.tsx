"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { FileText, User as UserIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <FileText className="h-6 w-6 text-primary" />
                    <span>PDF<span className="text-primary">Rigged</span></span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/merge_pdf" className="hover:text-primary transition-colors">Merge PDF</Link>
                    <Link href="/split_pdf" className="hover:text-primary transition-colors">Split PDF</Link>
                    <Link href="/compress_pdf" className="hover:text-primary transition-colors">Compress PDF</Link>
                    <Link href="/pdf_to_jpg" className="hover:text-primary transition-colors">PDF to JPG</Link>
                    <Link href="/jpg_to_pdf" className="hover:text-primary transition-colors">JPG to PDF</Link>
                </nav>
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium hidden sm:inline-block">Hi, {user.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => logout()}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
