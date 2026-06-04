/// <reference types="vite/client" />

declare module 'vue-cropper' {
    export interface VueCropperInstance {
        getCropBlob(callback: (blob: Blob) => void): void
        getCropData(callback: (data: string) => void): void
        startCrop(): void
        stopCrop(): void
        clearCrop(): void
        changeScale(num: number): void
        rotateLeft(): void
        rotateRight(): void
        finish(): void
    }

    const VueCropper: VueCropperInstance
    export { VueCropper }
}
