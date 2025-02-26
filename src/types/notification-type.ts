export enum WhatsappMessageTrigger {
  Med_Available = "available_now",
  Ready_For_Pickup = "ready_for_pickup",
  New_Batch_Soon = "new_batch_soon",
}

export interface WhatsappMessage {
  tag: string;
  editorBody: string;
  waBody?: string;
  trigger: {
    event: WhatsappMessageTrigger;
    label: string;
  };
}
