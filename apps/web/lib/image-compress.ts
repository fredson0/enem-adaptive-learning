const MAX_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 1600;

export async function compressImageForUpload(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Arquivo inválido");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  let quality = 0.86;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  if (blob.size > MAX_BYTES && outputType !== "image/jpeg") {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.8);
  }

  if (blob.size > MAX_BYTES) {
    throw new Error("Imagem muito grande. Use uma foto menor que 2 MB.");
  }

  return blob;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao comprimir imagem"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}
