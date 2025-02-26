import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ClientRequest } from "src/types/client-type";
import { Medication } from "src/types/medication-type";
import { isAfter, isBefore } from "date-fns";

export enum PriorityLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}

@Injectable({ providedIn: "root" })
export class ClientService {
  private hiddenValue: ClientRequest = {
    id: "",
    cpf: "",
    whatsapp: "",
    name: "",
    email: "",
    priority: null,
    medication: "",
    requestDate: null,
    dateLabel: "",
    clinicalEmergency: false,
    usage: null,
    score: 0,
  };

  private clientSubject = new BehaviorSubject<Medication[]>(
    this.loadDataFromStorage()
  );
  clients$ = this.clientSubject.asObservable();

  clearClient() {
    return this.hiddenValue;
  }

  private getPriorityLevel(score: number): PriorityLevel {
    if (score >= 5) return PriorityLevel.High;
    if (score === 3) return PriorityLevel.Medium;
    return PriorityLevel.Low;
  }

  loadDataFromStorage(): Medication[] | [] {
    const tmpClients = localStorage.getItem("medications");
    return tmpClients ? JSON.parse(tmpClients) : [];
  }

  reshuffleList(
    prevWaitingList: ClientRequest[],
    entireClientRequest: ClientRequest
  ) {
    let [leftEdgeIndex, rightEdgeIndex] = [0, prevWaitingList.length - 1];
    let [prevMidItem, nxtMidItem] = [null, null];

    while (leftEdgeIndex <= rightEdgeIndex) {
      let mid = Math.floor((leftEdgeIndex + rightEdgeIndex) / 2);
      const midItem = prevWaitingList[mid];

      if (
        isAfter(entireClientRequest.requestDate, midItem.requestDate) ||
        entireClientRequest.score < midItem.score
      ) {
        leftEdgeIndex = mid + 1;
        prevMidItem = midItem;
      } else if (
        isBefore(entireClientRequest.requestDate, midItem.requestDate) ||
        entireClientRequest.score > midItem.score
      ) {
        rightEdgeIndex = mid - 1;
        nxtMidItem = midItem;
      }
    }

    let position = prevWaitingList.findIndex((client) => client === nxtMidItem);
    prevWaitingList.splice(
      position === -1 ? prevWaitingList.length : position,
      0,
      entireClientRequest
    );

    return prevWaitingList.reverse();
  }

  saveClient(client: ClientRequest) {
    const whatsappRegExp =
      /^\+?\d{0,3}?\s?(\(?\d{2,4}\)?)?\s?\d{4,5}[-.\s]?\d{4}$/;
    const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const requestInfosCondition = client.medication && client.usage;
    const personalInfosCondition =
      client.name && client.email && client.whatsapp && client.cpf;
    const validateWithRegExpConditions =
      whatsappRegExp.test(client.whatsapp) && emailRegExp.test(client.email);

    if (
      personalInfosCondition &&
      requestInfosCondition &&
      validateWithRegExpConditions
    ) {
      let tmp = localStorage.getItem("clients");

      if (tmp) {
        let prevClients = JSON.parse(tmp) as ClientRequest[];
        const clientAlreadyNoted = prevClients.find(
          (_client) =>
            _client.email === client.email ||
            _client.whatsapp === client.whatsapp
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

        let score: number = 0;
        if (client.clinicalEmergency) score += 5;
        if (client.usage === "continuous") score += 3;
        const scoreLabel = this.getPriorityLevel(score);
        client = { ...client, score, priority: scoreLabel };

        if (selectedMedication.waitingList) {
          // const reshuffledWaitingList = this.reshuffleList(
          //   prevMedications[prevMedicationWaitingListInIndexLocalStorage]
          //     .waitingList,
          //   client
          // );

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
