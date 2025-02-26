import { ClientRequest } from "./client-type";

export interface Medication {
  id: string;
  name: string;
  price: number;
  quantityInStock: number;
  status: "out_of_stock" | "restocking_soon" | "available_now";
  waitingList: ClientRequest[];
}

export interface EditedMedication {
  name: string;
  price: number;
  quantityInStock: number;
  status: "out_of_stock" | "restocking_soon" | "available_now";
}
