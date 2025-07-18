import axios from "axios";

export const cleanBase64 = (input: string) => {
  if (!input) {
    return "";
  }

  if (input.startsWith("data:")) {
    return input.substring(input.indexOf(",") + 1);
  }

  return input;
};

export function removeFileExtension(filePath: string): string {
  if (!filePath) return "";

  // Find the last dot to extract the file extension
  const lastDotIndex = filePath.lastIndexOf(".");

  const lastSlashIndex = Math.max(
    filePath.lastIndexOf("/"),
    filePath.lastIndexOf("\\")
  );

  // If no dot is found or it's part of the directory name, return the original path
  if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) return filePath;

  // Extract the filename without extension
  return filePath.substring(0, lastDotIndex);
}

const fileTypes = {
  jpg: "image/jpg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf"
};

export const getBase64FromURL = async (
  url: string,
  type: keyof typeof fileTypes = "png"
) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    return `data:${fileTypes[type]};base64,${Buffer.from(
      response.data
    ).toString("base64")}`;
  } catch (error) {
    throw error;
  }
};

export const extractFileData = (url: string) => {
  if (!url || typeof url !== "string") {
    return { name: "", type: "" as keyof typeof fileTypes };
  }

  const [name, type] = url.split("/")[url.split("/").length - 1].split(".");

  return { name, type: type as keyof typeof fileTypes };
};

export function extractPublicId(url: string) {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^/.]+)/);

  return match ? match[1] : url;
}
