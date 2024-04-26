export interface RequestStatus {
    statusText: "success" | "error" | "pending",
    message?: string
}