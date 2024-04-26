import { getCookie, removeCookie, setCookie } from "typescript-cookie";
import { usePathname, useSearchParams } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type AuthContextData = {
    token?: string;
    loading: boolean;
    signIn(token: string): void;
    signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider = ({
    children
}: {
    children: React.ReactNode
}) => {

    const [token, setToken] = useState<string>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, [])

    const signIn = (_token: string) => {
        setToken(_token);
        setCookie("@Token", _token);
    }

    const signOut = () => {
        setToken(undefined);
        removeCookie("@Token");
    }

    async function loadStorageData() {
        try {

            const tokenFromCookie = getCookie('token');

            if (tokenFromCookie) setToken(tokenFromCookie);

        } catch (error) { }
        finally {
            setLoading(false);
        }
    }

    const useProtectedRoute = (_token: string) => {

        const pathname = usePathname()
        const searchParams = useSearchParams()
        const router = useRouter()

        useEffect(() => {
            const inAuthGroup = pathname.slice(0, 4) === "/auth";

            console.log(pathname.slice(0, 4))

            if (loading) return;

            if (!token && !inAuthGroup) {
                router.push("/auth/login")
            } else {
                router.push("/")
            }

        }, [_token, loading, searchParams, pathname])

    }

    // useProtectedRoute(token as string)

    return (
        <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )

}

function useAuth(): AuthContextData {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export { AuthContext, AuthProvider, useAuth }