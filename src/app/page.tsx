import Link from "next/link"
import { ToolCard } from "@/components/ui/ToolCard"
import { AdBanner } from "@/components/ads/AdBanner"
import { GitMerge, Scissors, Minimize2, FileImage, Image as ImageIcon } from "lucide-react"

const tools = [
  {
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: GitMerge,
    href: "/merge_pdf",
  },
  {
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: Scissors,
    href: "/split_pdf",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    icon: Minimize2,
    href: "/compress_pdf",
  },
  {
    title: "PDF to JPG",
    description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    icon: FileImage,
    href: "/pdf_to_jpg",
  },
  {
    title: "JPG to PDF",
    description: "Convert your images to PDF. Adjust orientation and margins.",
    icon: ImageIcon,
    href: "/jpg_to_pdf",
  },
]

export default function Home() {
  return (
    <div className="container py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Every tool you need to work with PDFs in one place
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
          <br />
          <Link href="/ai-pdf-tools" className="text-primary hover:underline text-base mt-2 inline-block">
            Optimize for ChatGPT, Claude & Gemini &rarr;
          </Link>
        </p>
        <AdBanner slotId="1234567890" className="mb-8" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  )
}
