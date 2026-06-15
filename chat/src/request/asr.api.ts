import { post } from './fetch';

/**
 * 语音识别
 */
export const asrRecognizeRequest = (file: Blob, filename: string) => {
    const formData = new FormData();
    formData.append("audio", file, filename);
    return post<string>("/asr/recognize", void 0, {
        body: formData,
    });
};