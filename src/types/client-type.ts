export interface ClientRequest {
  id: string;
  name: string;
  email: string;
  requestDate: string;
  medication: string;
  phoneNumber: string;
  priority: "low" | "medium" | "higher";
}
