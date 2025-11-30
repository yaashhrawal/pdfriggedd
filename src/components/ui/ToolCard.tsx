import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    className?: string
}

export function ToolCard({ title, description, icon: Icon, href, className }: ToolCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex flex-col items-start p-6 glass-card shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 hover:bg-white/80",
                className
            )}
        >
            <div className="p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                <Icon className="w-6 h-6 icon-3d" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </Link>
    )
}
