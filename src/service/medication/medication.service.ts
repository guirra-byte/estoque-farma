import { Injectable } from "@angular/core";
import { NotificationService } from "@service/notification/notification.service";
import { BehaviorSubject } from "rxjs";
import { EditedMedication, Medication } from "src/types/medication-type";

@Injectable({ providedIn: "root" })
export class MedicationService {
  private hiddenValue = {
    id: "",
    name: "",
    price: 0,
    status: null,
    waitingList: [],
    quantityInStock: 0,
  };

  constructor(private notificationService: NotificationService) {}
  private medicationSubject = new BehaviorSubject<Medication[]>(
    this.loadDataFromStorage()
  );
  medications$ = this.medicationSubject.asObservable();

  clearMedication() {
    return this.hiddenValue;
  }

  loadDataFromStorage(): Medication[] | [] {
    const tmpMedications = localStorage.getItem("medications");
    return tmpMedications ? JSON.parse(tmpMedications) : [];
  }

  saveMedication(medication: Medication) {
    const inStockConditional =
      medication.status === "available_now" && medication.quantityInStock > 0;

    const outOfStockConditional =
      (medication.status === "out_of_stock" ||
        medication.status === "restocking_soon") &&
      medication.quantityInStock === 0;

    if (medication.name !== "" && medication.price > 0) {
      if (inStockConditional || outOfStockConditional) {
        let prevMedications = this.loadDataFromStorage();
        //Clients Waiting List will be working with FIFO or Queue (First In First Out);
        prevMedications = [medication, ...prevMedications];

        let count = 0;

        // Order by Waiting List Length (ASC)
        const reshuffleList = (
          storageData: Medication[],
          currIndex: number = 0,
          nxtIndex: number = 1
        ) => {
          if (currIndex === storageData.length) return storageData;

          let tmp = storageData[currIndex];
          let nxtItem = storageData[nxtIndex];

          if (tmp.waitingList.length < nxtItem.waitingList.length) {
            storageData[currIndex] = nxtItem;
            storageData[nxtIndex] = tmp;
          }

          nxtIndex++;
          if (count === storageData.length - 1) {
            currIndex++;
            nxtIndex = 0;
            count = 0;
          }

          count++;
          reshuffleList(storageData, currIndex, nxtIndex);
        };

        const orderedList =
          prevMedications.length > 1
            ? reshuffleList(prevMedications)
            : prevMedications;

        localStorage.setItem("medications", JSON.stringify(prevMedications));
        this.medicationSubject.next(prevMedications);
      }
    }
  }

  async editMedication(
    prevMedication: Medication,
    newData: EditedMedication | null
  ) {
    if (!newData) return;

    const inStockConditional =
      newData.status === "available_now" && newData.quantityInStock > 0;

    const outOfStockConditional =
      (newData.status === "out_of_stock" ||
        newData.status === "restocking_soon") &&
      newData.quantityInStock === 0;

    if (inStockConditional || outOfStockConditional) {
      const storageData = this.loadDataFromStorage();
      if (storageData.length === 0) return;

      const index = storageData.findIndex(
        (medication) => medication?.name === prevMedication.name
      );

      if (index === -1) {
        return;
      }

      const overwritedData: Medication = {
        ...prevMedication,
        ...newData,
      };

      storageData[index] = overwritedData;
      localStorage.setItem("medications", JSON.stringify(storageData));
    }
  }
}
