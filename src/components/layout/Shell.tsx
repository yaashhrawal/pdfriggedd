import { Header } from "./Header"
import { Footer } from "./Footer"

interface ShellProps {
    children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
