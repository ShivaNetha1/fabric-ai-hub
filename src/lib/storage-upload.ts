import { supabase } from "./supabase";

/**
 * Uploads a file to the 'product-images' bucket in Supabase Storage.
 * Generates a clean path: [supplierId]/[timestamp].[extension]
 * If bucket is missing or connection fails, falls back to returning the image as a Base64 data URL.
 */
export async function uploadProductImage(file: File, supplierId: string): Promise<string> {
  // Ensure the bucket exists (only works if user has permissions, otherwise fails silently)
  try {
    await supabase.storage.createBucket("product-images", {
      public: true,
      fileSizeLimit: 5242880, // 5MB limit
    });
  } catch (err) {
    // Fail silently if bucket already exists or permissions restrict creation
  }

  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${supplierId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.warn("Storage upload failed, falling back to Base64 data URL:", err);
    
    // Fallback: convert file to base64 string so the user can save the product immediately
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file as Base64."));
      };
      reader.readAsDataURL(file);
    });
  }
}
