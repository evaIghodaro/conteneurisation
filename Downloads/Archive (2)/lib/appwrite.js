import { Client, Account, Databases, Storage } from "react-native-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69affc7700001ffcdc45")
  .setPlatform("com.eva.devmobile");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = "69b7c5df001771f61882";

export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products", 
  ORDERS: "orders"
};

export const BUCKETS = {
  PRODUCT_IMAGES: "product-images"
};
