import { PriorityLevel } from "@service/client/client-service";

export interface ClientRequest {
  id: string;
  name: string;
  email: string;
  requestDate: Date;
  phoneNumber: string;
  medication: string;
  usage: "continuous" | "occasional";
  clinicalEmergency: boolean;
  priority: PriorityLevel;
  score: number
}
