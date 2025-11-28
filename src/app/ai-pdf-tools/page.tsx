import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { AdBanner } from "@/components/ads/AdBanner"
import { Bot, FileText, Sparkles, Zap } from "lucide-react"

export const metadata: Metadata = {
    title: "Best PDF Tools for AI: ChatGPT, Claude, Gemini & Perplexity",
    description: "Learn how to prepare your PDF documents for AI analysis. Merge, split, and compress PDFs to fit context windows for ChatGPT, Claude, and Gemini.",
}

export default function AiPdfToolsPage() {
    return (
        <div className="container py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Optimize PDFs for <span className="text-primary">AI Workflows</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Prepare your documents for Large Language Models (LLMs) like ChatGPT, Claude, Gemini, and Perplexity.
                    </p>
                    <AdBanner slotId="9876543210" className="mb-8" />
                </div>

                <div className="grid gap-12">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Bot className="w-8 h-8 text-primary" />
                            <h2 className="text-2xl font-bold">Why Optimize PDFs for AI?</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            AI models have limits. <strong>Context windows</strong> (the amount of text an AI can process) are finite.
                            Uploading a massive, unoptimized PDF to <strong>ChatGPT</strong> or <strong>Claude</strong> often results in errors or hallucinations.
                            By splitting large files or compressing them, you ensure the AI focuses on exactly what you need.
                        </p>
                    </section>

                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-6 h-6 text-yellow-500" />
                                <h3 className="text-xl font-semibold">Reduce Token Usage</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Don't waste tokens on irrelevant pages. Use our <strong>Split PDF</strong> tool to extract only the chapters you need for analysis.
                            </p>
                            <Link href="/split_pdf">
                                <Button variant="outline" className="w-full">Split PDF for AI</Button>
                            </Link>
                        </div>

                        <div className="bg-card p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-blue-500" />
                                <h3 className="text-xl font-semibold">Fit File Size Limits</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                <strong>Claude</strong> and <strong>Gemini</strong> have file size limits. Use our <strong>Compress PDF</strong> tool to shrink documents without losing text clarity.
                            </p>
                            <Link href="/compress_pdf">
                                <Button variant="outline" className="w-full">Compress PDF for Upload</Button>
                            </Link>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-purple-500" />
                            <h2 className="text-2xl font-bold">Supported AI Platforms</h2>
                        </div>
                        <ul className="grid md:grid-cols-2 gap-4">
                            {[
                                "ChatGPT (OpenAI)",
                                "Claude 3.5 Sonnet (Anthropic)",
                                "Gemini 1.5 Pro (Google)",
                                "Perplexity AI",
                                "Microsoft Copilot",
                                "Llama 3 (Meta)"
                            ].map((ai) => (
                                <li key={ai} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    {ai}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className="bg-primary/5 p-8 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold mb-4">Ready to boost your productivity?</h3>
                        <p className="text-muted-foreground mb-6">
                            Start optimizing your documents today. It's free, secure, and fast.
                        </p>
                        <Link href="/">
                            <Button size="lg" className="text-lg px-8">Go to All Tools</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
