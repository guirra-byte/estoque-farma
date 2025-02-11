import { ClientRequest } from "src/app/home";

export interface Medication {
  id: string;
  name: string;
  price: number;
  quantityInStock: number;
  status: "out_of_stock" | "restocking_soon" | "available_now";
  waitingList: ClientRequest[];
}
