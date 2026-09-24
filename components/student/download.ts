import apiClient from "@/services/apiClient";

/**
 * Downloads an API file (path relative to /api) and saves it with `filename`.
 * Throws on any non-2xx response so callers can show a real error instead of
 * saving an error JSON body as a ".pdf".
 */
export const downloadApiFile = async (path: string, filename: string) => {
  const response = await apiClient.get<Blob>(path, {
    responseType: "blob",
    timeout: 60_000,
  });

  const blob = response.data;
  if (blob.type.includes("application/json")) {
    let message = "The file isn't available right now.";
    try {
      const body = JSON.parse(await blob.text());
      message = body?.error || body?.message || message;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
