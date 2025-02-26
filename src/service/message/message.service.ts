import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { WhatsappMessage } from "src/types/notification-type";
import { WaFormatterUtil } from "src/utils/wa-formatter-util";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  constructor() {}

  private messageSubject = new BehaviorSubject<WhatsappMessage[]>(
    this.loadDataFromStorage()
  );

  messages$ = this.messageSubject.asObservable();
  loadDataFromStorage(): WhatsappMessage[] {
    const tmp = localStorage.getItem("messages");
    return tmp ? JSON.parse(tmp) : [];
  }

  saveMessageEditor(message: WhatsappMessage) {
    const waTextFormat = WaFormatterUtil(message.editorBody);
    message.waBody = waTextFormat;

    const prevMessages = this.loadDataFromStorage();
    prevMessages.push(message);

    localStorage.setItem("messages", JSON.stringify(prevMessages));
    this.messageSubject.next(prevMessages);
  }
}
