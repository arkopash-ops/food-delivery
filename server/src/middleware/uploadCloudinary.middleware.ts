import cloudinary from "../config/cloudinary.js";
import type { UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

export const uploadCloudinary = (
    buffer: Buffer,
    folder: string
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Upload failed"));
                }
                resolve(result);
            }
        );

        Readable.from(buffer).pipe(stream);
    });
};
