<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" vertical color="primary" animated>
      <!-- Step 1: App ID Input -->
      <q-step :name="1" title="Select Partner & Platform" icon="settings" :done="step > 1">
        <q-select
          v-model="selectedPartner"
          :options="partners"
          label="Select Partner"
          outlined
          dense
          class="q-mb-sm"
        />

        <q-input
          :model-value="computedAppId"
          label="App ID"
          outlined
          dense
          readonly
          class="q-mb-sm"
        />

        <q-select
          v-model="selectedPlatform"
          :options="platformOptions"
          label="Select Platform"
          outlined
          dense
          class="q-mb-sm"
        />

        <q-input
          :model-value="packageName"
          label="Package Name"
          outlined
          dense
          readonly
          class="q-mb-sm"
        />

        <q-stepper-navigation>
          <q-btn
            @click="checkAppId"
            color="primary"
            label="Continue"
            :loading="loading"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Login -->
      <q-step :name="2" title="Login" icon="login">
        <q-card class="q-mb-md q-pa-md" bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Status API Response:</div>
            <div><strong>Games:</strong> {{ parsedStatus.games?.join(', ') }}</div>
            <div><strong>License Active:</strong> {{ parsedStatus.isLicenseActive ? 'Yes ✅' : 'No ❌' }}</div>
            <div><strong>License Expires At:</strong> {{ licenseExpirationDate }}</div>
          </q-card-section>
        </q-card>

        <q-input v-model="name" label="Name" outlined dense />

        <q-stepper-navigation>
          <q-btn @click="login" color="primary" label="Login" :loading="loginLoading" />
          <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth'
import type { AxiosError } from 'axios';
import CONSTANTS from '../constants/constants';
import { getPartnerStatus } from 'src/api/api';
import type ICustomApiHeaders from 'src/interfaces/CustoApiHeaders.interface';
type PartnerKey = keyof typeof CONSTANTS.PARTNERS_DATA;
type PlatformKey = 'ios' | 'android' | 'web';
type ApiError = { message?: string };


const authStore = useAuthStore();
const $q = useQuasar();
const router = useRouter();

const step = ref(1);
const loading = ref(false);
const loginLoading = ref(false);

const name = ref('');
const statusResponse = ref('');

const partners = Object.keys(CONSTANTS.PARTNERS_DATA) as PartnerKey[];
const selectedPartner = ref<PartnerKey | ''>('');
const selectedPlatform = ref<PlatformKey | ''>('');

const platformOptions = computed<PlatformKey[]>(() => {
  if (!selectedPartner.value) return [];
  return Object.keys(CONSTANTS.PARTNERS_DATA[selectedPartner.value]?.PLATFORMS || {}) as PlatformKey[];
});


const computedAppId = computed(() =>
  selectedPartner.value
    ? CONSTANTS.PARTNERS_DATA[selectedPartner.value]?.APP_ID || ''
    : ''
);

const packageName = computed(() =>
  selectedPartner.value && selectedPlatform.value
    ? CONSTANTS.PARTNERS_DATA[selectedPartner.value]?.PLATFORMS[selectedPlatform.value] || ''
    : ''
);

const checkAppId = async () => {
  if (!computedAppId.value || !packageName.value) {
    $q.notify({ type: 'negative', message: 'Missing App ID or Package Name' });
    return;
  }
  const headers: ICustomApiHeaders = {
    appId: computedAppId.value.toString(),
    platform: selectedPlatform.value,
    packageName: packageName.value,
  };

  try {
    loading.value = true;
    const res = await getPartnerStatus(headers);

    statusResponse.value = JSON.stringify(res, null, 2);
    step.value = 2;
  } catch (err) {
    console.log('from error');
    const error = err as AxiosError;
    const message =
      (error.response?.data as ApiError)?.message || error.message || 'API error';
    $q.notify({ type: 'negative', message });
  } finally {
    loading.value = false;
  }
};

const login = async () => {
  try {
    loginLoading.value = true;

    await authStore.fetchToken({
      appId: +computedAppId.value,
      userId: `${CONSTANTS.USER_ID_PREFIX}_${name.value}`,
      name: name.value,
      profilePic: CONSTANTS.DEFAULT_PICTURE_URL,
    });

    await router.push('/game');
  } catch (err) {
    const error = err as AxiosError;
    const message =
      (error.response?.data as ApiError)?.message || error.message || 'Login failed';
    $q.notify({ type: 'negative', message });
  } finally {
    loginLoading.value = false;
  }
};
const parsedStatus = computed(() => {
  try {
    return JSON.parse(statusResponse.value || '{}');
  } catch {
    return {};
  }
});

const licenseExpirationDate = computed(() => {
  const ts = parsedStatus.value.licenseExpireAt;
  if (!ts) return '-';
  return new Date(ts).toLocaleString();
});
</script>
