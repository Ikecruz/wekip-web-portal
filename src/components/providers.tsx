"use client"

import { AuthProvider } from "@/contexts/auth.context"
import { MantineProvider } from "@mantine/core"

const Providers = ({
    children
}: {
    children: React.ReactNode
}) => {

    return <>
        <MantineProvider
            theme={{
                headings: { fontFamily: "var(--font-heading)" },
                fontFamily: "var(--font-main)",
                breakpoints: {
                    sm: '480px',
                    md: '768px',
                    lg: '976px',
                    xl: '1440px',
                },
                primaryColor: "dark"
            }}
            withCssVariables
            withGlobalClasses
        >
            <AuthProvider>
                {children}
            </AuthProvider>
        </MantineProvider>
    </>

}

export default Providers