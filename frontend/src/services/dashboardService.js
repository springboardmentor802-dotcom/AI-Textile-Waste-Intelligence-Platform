import api from "./api";

/**
 * Fetch the dashboard data for the currently authenticated user.
 *
 * The backend reads the user's role from the JWT and automatically
 * returns the correct dashboard:
 *
 * Admin     -> Administrator Dashboard
 * Industry  -> Textile Manufacturer Dashboard
 * Recycler  -> Recycling Facility Operator Dashboard
 * NGO       -> Sustainability Manager Dashboard
 */
export const getDashboardData = async () => {
  try {
    const response = await api.get("/dashboard/");

    return response.data;
  } catch (error) {
    console.error(
      "Failed to load role-based dashboard:",
      error
    );

    throw error;
  }
};