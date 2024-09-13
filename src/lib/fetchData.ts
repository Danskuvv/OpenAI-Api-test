import {ErrorResponse} from '../types/MessageTypes';

const fetchData = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    console.log('fetchData request:', url, options);
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
      const errorJson = json as unknown as ErrorResponse;
      if (errorJson.message) {
        throw new Error(errorJson.message);
      }
      throw new Error(`Error ${response.status} occurred`);
    }
    return json;
  } catch (error) {
    console.error('fetchData error:', error);
    throw error;
  }
};

export default fetchData;