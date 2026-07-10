export interface ProfileDocument {
  $id: string;
  name: string;
  bio: string;
  photo_url: string | null;
}

export interface ItemDocument {
  $id: string;
  title: string;
  description: string;
  image_url: string | null;
  website_url?: string | null;
  code_url?: string | null;
}
