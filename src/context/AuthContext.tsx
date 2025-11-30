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
    login: (email: string, password?: string) => Promise<void>
    signup: (name: string, email: string, password?: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        // Check for persisted session on mount
        const storedSession = localStorage.getItem("pdf_rigged_session")
        if (storedSession) {
            setUser(JSON.parse(storedSession))
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password?: string) => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500)) // Fake delay

        const usersDb = localStorage.getItem("pdf_rigged_users_db")
        const users = usersDb ? JSON.parse(usersDb) : []

        const foundUser = users.find((u: any) => u.email === email && u.password === password)

        if (foundUser) {
            const sessionUser = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email
            }
            setUser(sessionUser)
            localStorage.setItem("pdf_rigged_session", JSON.stringify(sessionUser))
            setIsLoading(false)
        } else {
            setIsLoading(false)
            throw new Error("Invalid email or password")
        }
    }

    const signup = async (name: string, email: string, password?: string) => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500)) // Fake delay

        const usersDb = localStorage.getItem("pdf_rigged_users_db")
        const users = usersDb ? JSON.parse(usersDb) : []

        if (users.find((u: any) => u.email === email)) {
            setIsLoading(false)
            throw new Error("User already exists")
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password // In a real app, hash this!
        }

        users.push(newUser)
        localStorage.setItem("pdf_rigged_users_db", JSON.stringify(users))

        const sessionUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }

        setUser(sessionUser)
        localStorage.setItem("pdf_rigged_session", JSON.stringify(sessionUser))
        setIsLoading(false)
    }

    const logout = async () => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 500))
        setUser(null)
        localStorage.removeItem("pdf_rigged_session")
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
