import { supabase } from "./supabase";

/**
 * Uploads a file to the 'product-images' bucket in Supabase Storage.
 * Generates a clean path: [supplierId]/[timestamp].[extension]
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
}
