import API from "../api/axios";

export const getRecommendations = async () => {
  const response = await API.get(
    "/recommendations/"
  );

  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    Array.isArray(
      payload?.recommendations
    )
  ) {
    return payload.recommendations;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
};