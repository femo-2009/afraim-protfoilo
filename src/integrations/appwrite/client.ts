import { Client, Account, Databases, Storage } from "appwrite";

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;

if (!APPWRITE_PROJECT_ID) {
  throw new Error("Missing APPWRITE_PROJECT_ID env var");
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID };
export const appwriteClient = client;
export const DATABASE_ID = "6a4ee1e2003d9dc0cf9d";
export const ADMIN_EMAIL = "afraimfarag7@gmail.com";
