"use client"

import * as React from "react"

interface User {
    id: string
    name: string
    email: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string) => Promise<void>
    signup: (name: string, email: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        // Check for persisted user on mount
        const storedUser = localStorage.getItem("pdf_rigged_user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string) => {
        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock login - in a real app, we'd verify password
        const mockUser = {
            id: "1",
            name: email.split("@")[0], // Derive name from email for demo
            email,
        }

        setUser(mockUser)
        localStorage.setItem("pdf_rigged_user", JSON.stringify(mockUser))
        setIsLoading(false)
    }

    const signup = async (name: string, email: string) => {
        setIsLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUser = {
            id: "1",
            name,
            email,
        }

        setUser(mockUser)
        localStorage.setItem("pdf_rigged_user", JSON.stringify(mockUser))
        setIsLoading(false)
    }

    const logout = async () => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setUser(null)
        localStorage.removeItem("pdf_rigged_user")
        setIsLoading(false)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
