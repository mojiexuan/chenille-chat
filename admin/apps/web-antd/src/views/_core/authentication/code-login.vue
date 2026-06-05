<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { AuthenticationCodeLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { phoneCodeRequest } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'CodeLogin' });

const authStore = useAuthStore();

// 认录登录组件实例
const authCodeLoginRef = ref();

const loading = ref(false);
const CODE_LENGTH = 6;

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.mobile'),
      },
      fieldName: 'phoneNumber',
      label: $t('authentication.mobile'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.mobileTip') })
        .refine((v) => /^\d{11}$/.test(v), {
          message: $t('authentication.mobileErrortip'),
        }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          const text =
            countdown > 0
              ? $t('authentication.sendText', [countdown])
              : $t('authentication.sendCode');
          return text;
        },
        handleSendCode,
        placeholder: $t('authentication.code'),
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});

/**
 * 异步处理发送验证码操作
 */
async function handleSendCode() {
  if (!authCodeLoginRef.value) {
    console.error('authCodeLoginRef 是未初始化的');
    throw new Error('应用异常');
  };
  const formApi = authCodeLoginRef.value.getFormApi();
  const { valid } = await formApi.validateField('phoneNumber');
  if (!valid) {
    throw new Error('手机号格式错误');
  }
  const values = await formApi.getValues();
  await phoneCodeRequest({ phone: values.phoneNumber });
}

/**
 * 异步处理登录操作
 * Asynchronously handle the login process
 * @param values 登录表单数据
 */
async function handleLogin(values: Recordable<any>) {
  loading.value = true;
  try {
    await authStore.authLogin({
      phone: values.phoneNumber,
      code: values.code,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthenticationCodeLogin ref="authCodeLoginRef" :form-schema="formSchema" :loading="loading" @submit="handleLogin" />
</template>
