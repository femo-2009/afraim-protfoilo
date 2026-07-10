import { storage, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/integrations/appwrite/client";
import { ID } from "appwrite";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const result = await storage.createFile("portfolio", ID.unique(), file);
  return `${APPWRITE_ENDPOINT}/storage/buckets/portfolio/files/${result.$id}/view?project=${APPWRITE_PROJECT_ID}`;
}
