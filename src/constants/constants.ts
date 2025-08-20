const PARTNERS_DATA_LOCAL = {
  CHINGARI: {
    APP_ID: 1020222,
    PLATFORMS: {
      ios: 'io.company.games.ios',
      android: 'io.company.games.android',
      web: 'io.company.games.web',
    },
  },
};

const BASE_URLS = {
  DEV: {
    SDK_BASE_URL: 'http://localhost:8300',
  },
};

export type RoadType =
  | 'BUMPY'
  | 'DIRT'
  | 'HIGHWAY'
  | 'DESERT'
  | 'POTHOLES'
  | 'EXPRESSWAY'
  | 'UNKNOWN';

const CONSTANTS = {
  roadColors: {
    BUMPY: '#a0522d',
    DIRT: '#8b4513',
    HIGHWAY: '#323232',
    DESERT: '#edc9af',
    POTHOLES: '#3a3a3a',
    EXPRESSWAY: '#0064c8',
    UNKNOWN: '#800080',
  } as Record<RoadType, string>,
  PARTNERS_DATA: PARTNERS_DATA_LOCAL,
  BASE_URLS: BASE_URLS.DEV,
  USER_ID_PREFIX: 123123123123123,
  DEFAULT_PICTURE_URL:
    'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Fpremium-vector%2Fmale-avatar-icon-unknown-anonymous-person-default-avatar-profile-icon-social-media-user-business-man-man-profile-silhouette-isolated-white-background-vector-illustration_32946438.htm&psig=AOvVaw270tO2YUvIev1fmFGLNhqM&ust=1750090328274000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIjcx9Xo840DFQAAAAAdAAAAABAE',
};

export default CONSTANTS;
