import { reactive } from 'vue';

/**
 * 预览图片的状态
 */
export const previewPictureState = reactive({
    visible: false,
    src: '' as string | File | Blob,
});

/**
 * 预览图片的 composable
 */
export function usePreviewPicture() {
    
    /**
     * 展示预览图片
     */
    function show(src: string | File | Blob) {
        previewPictureState.visible = true;
        previewPictureState.src = src;
    }
    
    /**
     * 隐藏预览图片
     */
    function hide() {
        previewPictureState.visible = false;
        previewPictureState.src = '';
    }

    return {
        show,
        hide,
    };
}