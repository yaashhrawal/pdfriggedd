import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-semibold mb-4">PDF Rigged</h3>
                        <p className="text-sm text-muted-foreground">
                            Your one-stop shop for all PDF tools. Secure, fast, and free.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/merge_pdf">Merge PDF</Link></li>
                            <li><Link href="/split_pdf">Split PDF</Link></li>
                            <li><Link href="/compress_pdf">Compress PDF</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">About</Link></li>
                            <li><Link href="#">Blog</Link></li>
                            <li><Link href="#">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} PDF Rigged. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
