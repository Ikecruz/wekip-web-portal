'use client'

import Typography from "@/constants/Typography"
import { RequestStatus } from "@/interfaces/status.interface"
import { makePublicApiCall } from "@/services/api.service"
import { Alert, Button, Group, PasswordInput, PinInput, Text, TextInput } from "@mantine/core"
import { Dropzone, FileWithPath, PDF_MIME_TYPE } from "@mantine/dropzone"
import { useForm, zodResolver } from "@mantine/form"
import { AxiosError } from "axios"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { BiErrorCircle } from "react-icons/bi"
import { BsCheck2Circle, BsX } from "react-icons/bs"
import { LuUploadCloud } from "react-icons/lu"
import { MdOutlineReceipt } from "react-icons/md"
import validator from "validator"
import { z } from "zod"

const Upload = () => {

    const router = useRouter()
    const [files, setFiles] = useState<FileWithPath[]>([]);

    const [status, setStatus] = useState<RequestStatus | null>(null)

    const schema = z.object({
        share_code: z.string().min(1, { message: "Share code is required" })
    })

    const form = useForm({
        validate: zodResolver(schema),
        initialValues: {
            share_code: ''
        }
    })

    const handleSubmit = async (values: typeof form.values) => {

        setStatus({ statusText: "pending" })

        const formData = new FormData()
        formData.append('receipt', files[0])
        formData.append('share_code', values.share_code)

        try {
            await makePublicApiCall({
                method: "POST",
                url: "/receipt",
                body: formData
            })
            setStatus({ statusText: "success", message: "Receipt uploaded successfully" })

        } catch (err) {
            if (err instanceof AxiosError) {
                setStatus({ statusText: "error", message: err.response?.data.message })
            }
        }

    }

    return <>

        <div className="h-[100vh] w-full flex justify-center items-center">
            <div className="flex flex-col w-[500px]">
                <p className="text-3xl font-extrabold mb-1" style={{ fontFamily: Typography.heading }}>Upload Portal</p>
                <Text size="sm" c="gray" mb={20}>Enter User's share code and upload receipt</Text>
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
                        {...form.getInputProps("share_code")}
                    />
                    <Dropzone
                        onDrop={(files) => {
                            setFiles(files)
                        }}
                        maxSize={5 * 1024 ** 2}
                        accept={PDF_MIME_TYPE}
                    >
                        <Group justify="center" gap="7" mih={200} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <LuUploadCloud 
                                    size={45}
                                    style={{ color: 'var(--mantine-color-blue-6)' }}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <BsX 
                                    size={45}
                                    style={{ color: 'var(--mantine-color-red-6)' }}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <MdOutlineReceipt size={45} style={{ color: 'var(--mantine-color-dimmed)' }} />
                            </Dropzone.Idle>

                            <div>
                                <Text size="md" inline>
                                    Drag receipt here or click to select files
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                    <Button loading={status?.statusText === "pending"} type="submit">
                        Upload
                    </Button>
                </form>
            </div>
        </div>

    </>

}

export default Upload