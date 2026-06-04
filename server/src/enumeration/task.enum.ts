/**
 * 任务状态
 */
export enum TaskStatus {
    Pending = "pending",
    Running = "running",
    Succeeded = "succeeded",
    Error = "error",
    Canceled = "canceled",
    Timeout = "timeout",
}