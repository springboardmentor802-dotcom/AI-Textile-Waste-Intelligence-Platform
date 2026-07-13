import API from "../api/axios";

export const getRecommendations = () => {
  return API.get("/recommendations/");
};