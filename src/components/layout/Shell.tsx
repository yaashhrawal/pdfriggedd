import { Header } from "./Header"
import { Footer } from "./Footer"

interface ShellProps {
    children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="flex min-h-screen flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
