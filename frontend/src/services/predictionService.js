import api from "./api";

/**
 * Run the initial image and condition analysis.
 */
export async function predictTextile(
  file,
  weight
) {
  if (!file) {
    throw new Error(
      "A textile image is required."
    );
  }

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "weight",
    String(weight)
  );

  const response = await api.post(
    "/prediction/",
    formData
  );

  return response.data;
}

/**
 * Confirm the material for an existing upload.
 */
export async function confirmTextileMaterial(
  uploadId,
  material
) {
  if (!uploadId) {
    throw new Error(
      "A valid analysis ID is required."
    );
  }

  if (!material) {
    throw new Error(
      "Select a textile material."
    );
  }

  const response = await api.patch(
    `/prediction/${uploadId}/material`,
    {
      material,
    }
  );

  return response.data;
}

/**
 * Load prediction history.
 */
export async function getPredictionHistory() {
  const response = await api.get(
    "/prediction/history"
  );

  return response.data;
}