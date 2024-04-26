'use client'

import Typography from "@/constants/Typography"
import { RequestStatus } from "@/interfaces/status.interface"
import { makePublicApiCall } from "@/services/api.service"
import { Alert, Button, PasswordInput, PinInput, Text, TextInput } from "@mantine/core"
import { useForm, zodResolver } from "@mantine/form"
import { AxiosError } from "axios"
import { group } from "console"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { BiErrorCircle } from "react-icons/bi"
import { BsCheck2Circle } from "react-icons/bs"
import validator from "validator"
import { z } from "zod"

const Verify = () => {

    const router = useRouter()

    const [email, setEmail] = useState<string | null>(null)
    const searchParams = useSearchParams()

    useEffect(() => {
        const q = searchParams.get('q') as string

        if (!validator.isEmail(q)) {
            router.replace("/auth/login")
        }

        setEmail(q)

    }, [])


    const timer = useRef(30)
    const [displayTimer, setDisplayTimer] = useState<number | null>(null)

    const interval = () => {
        timer.current = timer.current - 1

        setDisplayTimer(timer.current)

        if (timer.current < 0) {
            timer.current = 30
            setDisplayTimer(null)
            return;
        }
        setTimeout(interval, 1000)
    }

    const resendPin = async () => {
        interval()

        try {
            await makePublicApiCall({
                method: "POST",
                url: "/auth/otp",
            })
        } catch (err) {
            console.log(err)
        }

    }

    const [status, setStatus] = useState<RequestStatus | null>(null)

    const schema = z.object({
        token: z.string().min(1, { message: "Field is required" })
    })

    const form = useForm({
        validate: zodResolver(schema),
        initialValues: {
            email,
            token: ''
        }
    })

    const handleSubmit = async (values: typeof form.values) => {

        setStatus({ statusText: "pending" })

        try {
            await makePublicApiCall({
                method: "POST",
                url: "/auth/verify-email",
                body: {
                    ...values,
                    group: "business"
                }
            })
            setStatus({ statusText: "success", message: "Your account has been successfully verified" })

            setTimeout(() => {
                router.push('/auth/login')
            }, 1000)
        } catch (err) {
            if (err instanceof AxiosError) {
                setStatus({ statusText: "error", message: err.response?.data.message })
            }
        }

    }

    return <>

        <div className="h-[100vh] w-full flex justify-center items-center">
            <div className="flex flex-col w-[400px]">
                <p className="text-3xl font-extrabold mb-1" style={{ fontFamily: Typography.heading }}>Verify Email</p>
                <Text size="sm" c="gray" mb={20}>We sent a verification code to {email}</Text>
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
                    <PinInput
                        length={6}
                        type="number"
                        placeholder=""
                        size="lg"
                        {...form.getInputProps("token")}
                    />
                    <Button loading={status?.statusText === "pending"} type="submit">
                        Submit
                    </Button>
                    <p className="text-[14px] text-center text-gray-600">
                        Didn't receive the email?{" "}
                        {
                            displayTimer === null &&
                            <Text
                                component="span"
                                className="text-brand cursor-pointer"
                                onClick={resendPin}
                            >
                                Resend
                            </Text>
                        }
                        {
                            displayTimer !== null &&
                            <span>
                                Try again in {""}
                                <span className="font-extrabold">{displayTimer}</span>
                            </span>
                        }
                    </p>
                </form>
            </div>
        </div>

    </>

}

export default Verify