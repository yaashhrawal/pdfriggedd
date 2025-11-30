"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { FileText, User as UserIcon, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function Header() {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const isHome = pathname === "/"

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="glass sticky top-0 z-50 pt-8 md:pt-0 border-b-0"
        >
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    {!isHome && (
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden mr-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <FileText className="h-6 w-6 text-primary" />
                        <span>PDF<span className="text-primary">Rigged</span></span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                    {[
                        { href: "/merge_pdf", label: "Merge PDF" },
                        { href: "/split_pdf", label: "Split PDF" },
                        { href: "/compress_pdf", label: "Compress PDF" },
                        { href: "/pdf_to_jpg", label: "PDF to JPG" },
                        { href: "/jpg_to_pdf", label: "JPG to PDF" },
                        { href: "/scanner", label: "Scanner" },
                        { href: "/sign_pdf", label: "Sign PDF" },
                    ].map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Button variant="ghost" size="sm" className={pathname === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}>
                                {link.label}
                            </Button>
                        </Link>
                    ))}
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
        </motion.header>
    )
}
