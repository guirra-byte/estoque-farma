import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ClientRequest } from "src/types/client-type";
import { Medication } from "src/types/medication-type";
import { formatDateUtil } from "src/utils/format-date-util";

@Injectable({ providedIn: "root" })
export class ClientService {
  private hiddenValue = {
    id: "",
    name: "",
    email: "",
    priority: null,
    medication: "",
    phoneNumber: "",
    requestDate: null,
  };

  private clientSubject = new BehaviorSubject<Medication[]>(
    this.loadDataFromStorage()
  );
  clients$ = this.clientSubject.asObservable();

  clearClient() {
    return this.hiddenValue;
  }

  loadDataFromStorage(): Medication[] | [] {
    const tmpClients = localStorage.getItem("medications");
    return tmpClients ? JSON.parse(tmpClients) : [];
  }

  saveClient(client: ClientRequest) {
    const phoneNumberRegExp =
      /^\+?\d{0,3}?\s?(\(?\d{2,4}\)?)?\s?\d{4,5}[-.\s]?\d{4}$/;
    const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const requestInfosCondition = client.medication && client.priority;

    const personalInfosCondition =
      client.email && client.email && client.phoneNumber;

    const validateWithRegExpConditions =
      phoneNumberRegExp.test(client.phoneNumber) &&
      emailRegExp.test(client.email);

    if (
      personalInfosCondition &&
      requestInfosCondition &&
      validateWithRegExpConditions
    ) {
      client.requestDate = formatDateUtil(new Date());
      let tmp = localStorage.getItem("clients");

      if (tmp) {
        let prevClients = JSON.parse(tmp) as ClientRequest[];
        const clientAlreadyNoted = prevClients.find(
          (client) =>
            client.email === client.email ||
            client.phoneNumber === client.phoneNumber
        );

        if (!clientAlreadyNoted) {
          prevClients = [...prevClients, client];
          localStorage.setItem("clients", JSON.stringify(prevClients));
        }
      } else {
        localStorage.setItem("clients", JSON.stringify([client]));
      }

      const tmpMedications = localStorage.getItem("medications");
      let prevMedications = tmpMedications
        ? (JSON.parse(tmpMedications) as Medication[])
        : [];

      const prevMedicationWaitingListInIndexLocalStorage =
        prevMedications.findIndex(
          (medication) => client.medication === medication.name
        );

      if (prevMedicationWaitingListInIndexLocalStorage !== -1) {
        // Valor de Referência
        const selectedMedication =
          prevMedications[prevMedicationWaitingListInIndexLocalStorage];

        if (selectedMedication.waitingList) {
          prevMedications[
            prevMedicationWaitingListInIndexLocalStorage
          ].waitingList.push(client);
        } else {
          prevMedications[
            prevMedicationWaitingListInIndexLocalStorage
          ].waitingList = [client];
        }

        localStorage.setItem("medications", JSON.stringify(prevMedications));
        this.clientSubject.next(prevMedications);
      }
    }
  }
}
