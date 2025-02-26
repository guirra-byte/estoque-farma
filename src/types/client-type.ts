import { PriorityLevel } from "@service/client/client.service";

export interface ClientRequest {
  id: string;
  cpf: string;
  name: string;
  email: string;
  score: number;
  usage: "continuous" | "occasional";
  whatsapp: string;
  medication: string;
  requestDate: Date;
  dateLabel: string
  priority: PriorityLevel;
  clinicalEmergency: boolean;
}
