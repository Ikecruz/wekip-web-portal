"use client"

import Typography from "@/constants/Typography";
import { Alert, Button, PasswordInput, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { z } from "zod";
import validator from "validator"
import { useForm, zodResolver } from "@mantine/form";
import { AxiosError } from "axios";
import { makePublicApiCall } from "@/services/api.service";
import { useState } from "react";
import { RequestStatus } from "@/interfaces/status.interface";
import { useAuth } from "@/contexts/auth.context";
import { BiErrorCircle } from "react-icons/bi";
import { BsCheck2Circle } from "react-icons/bs";
import Link from "next/link";

export default function LoginPage() {

    const router = useRouter()
    const { signIn } = useAuth()

    const schema = z.object({
        email: z.string().trim().refine(validator.isEmail, "Enter a valid email address"),
        password: z.string().min(1, { message: "Field is required" })
    })

    const form = useForm({
        validate: zodResolver(schema),
        validateInputOnBlur: true,
        initialValues: {
            email: '',
            password: ''
        }
    })

    const [status, setStatus] = useState<RequestStatus | null>(null);

    const handleSubmit = async (values: typeof form.values) => {

        setStatus({ statusText: "pending" })

        try {

            const response = await makePublicApiCall({
                method: "POST",
                url: "/auth/business/login",
                body: values
            })
            signIn(response.token)
            setStatus({ statusText: "success", message: "Login successfully...Redirecting to Portal" })

            setTimeout(() => {
                router.push('/')
            }, 1000)

        } catch (err: any) {
            if (err.status === 409) {
                router.push(`/auth/verify-email?q=${values.email}`)
            }

            console.log(err)

            setStatus({
                statusText: "error",
                message: err.data.message
            })

        }

    }

    return <>

        <div className="h-[100vh] w-full flex justify-center items-center">
            <div className="flex flex-col w-[400px]">
                <p className="text-3xl font-extrabold mb-5" style={{ fontFamily: Typography.heading }}>Login</p>
                {
                    (status && status.statusText !== "pending") &&
                    <Alert
                        color={status.statusText === "error" ? "red" : "green"}
                        title={status.statusText === "error" ? "Error" : "Success"}
                        icon={
                            status.statusText === "error" ?
                                <BiErrorCircle /> :
                                <BsCheck2Circle />
                        }
                        className="w-full mb-5"
                    >
                        {status.message}
                    </Alert>
                }
                <form
                    className="flex flex-col gap-5"
                    onSubmit={form.onSubmit(values => handleSubmit(values))}
                >
                    <TextInput
                        variant="filled"
                        className="w-full"
                        placeholder="Email"
                        {...form.getInputProps("email")}
                    />
                    <PasswordInput
                        variant="filled"
                        className="w-full"
                        placeholder="Password"
                        {...form.getInputProps("password")}
                    />
                    <Button loading={status?.statusText === "pending"} type="submit">
                        Submit
                    </Button>
                    <p className="text-[14px] text-center text-gray-600">New to Wekip?{" "}
                        <Link href="/auth/register" className="text-brand">Create an account</Link>
                    </p>
                </form>
            </div>
        </div>

    </>

}