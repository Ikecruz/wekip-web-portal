'use client'

import Typography from "@/constants/Typography"
import { Alert, Button, Image, PasswordInput, SimpleGrid, Text, TextInput } from "@mantine/core"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import validator from "validator"
import { useForm, zodResolver } from "@mantine/form"
import { useState } from "react"
import { RequestStatus } from "@/interfaces/status.interface"
import { AxiosError } from "axios"
import { BiErrorCircle } from "react-icons/bi"
import { BsCheck2Circle } from "react-icons/bs"
import { makePublicApiCall } from "@/services/api.service"
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone"

const Register = () => {

    const router = useRouter()

    const schema = z.object({
        email: z.string().trim().refine(validator.isEmail, "Enter a valid email address"),
        name: z.string().trim().min(3, "Business name should have at least 3 character"),
        password: z.string().trim().min(8, { message: 'Password should have at least 8 letters' }),
        confirmPassword: z.string().trim().min(8, { message: 'Confirm Password should have at least 8 letters' })
    }).refine(data => data.password === data.confirmPassword, { message: "Password and Confirm Password do not match", path: ["confirmPassword"] });

    const form = useForm({
        validate: zodResolver(schema),
        validateInputOnBlur: true,
        initialValues: {
            email: '',
            password: '',
            name: '',
            confirmPassword: ''
        }
    })

    const [files, setFiles] = useState<FileWithPath[]>([]);

    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return <Image key={index} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} />;
    });

    const [status, setStatus] = useState<RequestStatus | null>(null)

    const handleSubmit = async (values: typeof form.values) => {

        setStatus({ statusText: "pending" })

        const formData = new FormData()
        formData.append('image', files[0])
        formData.append('name', values.name)
        formData.append('email', values.email),
            formData.append('password', values.password)

        try {

            const response = await makePublicApiCall({
                method: "POST",
                url: "/auth/business/register",
                body: formData
            })
            setStatus({ statusText: "success", message: "Account created successfullt" })
            setTimeout(() => {
                router.push(`/auth/verify?q=${values.email}`)
            }, 500)

        } catch (err) {
            if (err instanceof AxiosError) {
                setStatus({ statusText: "error", message: err.response?.data.message })
            } else {
                setStatus({ statusText: "error", message: "An error occurred...Try again." })
            }
        }

    }

    return <>

        <div className="h-[100vh] w-full flex justify-center items-center">
            <div className="flex flex-col w-[400px]">
                <p className="text-3xl font-extrabold mb-5" style={{ fontFamily: Typography.heading }}>Register</p>
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
                    <TextInput
                        variant="filled"
                        className="w-full"
                        placeholder="Business name"
                        {...form.getInputProps("name")}
                    />
                    <div>
                        <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
                            <Text ta="center" size="sm">Drop Logo here</Text>
                        </Dropzone>

                        <SimpleGrid cols={{ base: 1, sm: 4 }} mt={previews.length > 0 ? 'xl' : 0}>
                            {previews}
                        </SimpleGrid>
                    </div>
                    <PasswordInput
                        variant="filled"
                        className="w-full"
                        placeholder="Password"
                        {...form.getInputProps("password")}
                    />
                    <Button loading={status?.statusText === "pending"} type="submit">
                        Submit
                    </Button>
                    <p className="text-[14px] text-center text-gray-600">Already have an account?{" "}
                        <Link href="/auth/login" className="text-brand">Login</Link>
                    </p>
                </form>
            </div>
        </div>

    </>

}

export default Register