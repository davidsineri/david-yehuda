export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  address?: string;
  phone?: string;
  updated_at: string;
}
