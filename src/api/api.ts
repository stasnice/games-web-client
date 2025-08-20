import constants from '../constants/constants';
import axios from 'axios';
import type ICustomApiHeaders from 'src/interfaces/CustoApiHeaders.interface';
import type GetPartnerStatusInterface from 'src/interfaces/responses/GetPartnerStatus.interface';
import type GetTokenInterface from 'src/api/dto/getToken.interface';

const { SDK_BASE_URL } = constants.BASE_URLS;

export async function getPartnerStatus(
  incomingHeaders: ICustomApiHeaders
): Promise<GetPartnerStatusInterface | string> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...incomingHeaders,
    };

    const response = await axios.get(`${SDK_BASE_URL}/partners/status`, {
      headers,
    });

    return response.data.data;
  } catch (error) {
    console.error('Error on get partner status:', error);

    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'Unknown Axios error';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error occurred';
  }
}

export async function getSessionDetails(params = {}, token: string, appId: number) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'appId': `${appId}`,
      Authorization: token,
    };

    const response = await axios.get(
      `${SDK_BASE_URL}/racing-game/session-details`,
      {
        headers,
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Помилка при завантаженні історії:', error);
  }
}

export async function getHistory(params = {}, token: string, appId: number) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'appId': `${appId}`,
      Authorization: token,
    };
    const response = await axios.get(`${SDK_BASE_URL}/racing-game/history`, {
      headers,
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Помилка при завантаженні історії:', error);
  }
}

export async function getToken(credentials: GetTokenInterface): Promise<string> {
  const response = await axios.post(`${SDK_BASE_URL}/partners/get-token`, credentials);

  return response.data.data.token
}
