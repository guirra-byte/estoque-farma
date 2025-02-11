import { ChangeDetectorRef, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Medication } from "src/types/medication-type";

@Injectable({ providedIn: "root" })
export class MedicationService {
  private hiddenValue = {
    id: "",
    name: "",
    price: 0,
    status: null,
    waitingList: null,
    quantityInStock: 0,
  };

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
        localStorage.setItem("medications", JSON.stringify(prevMedications));
        this.medicationSubject.next(prevMedications);
        // this.medications = prevMedications;
        // this.clearMedicationData();
      }
    }
  }
}
