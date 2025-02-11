import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ImportsModule } from "./imports";
import { MenuItem } from "primeng/api";

export interface Medication {
  id: string;
  name: string;
  price: number;
  quantityInStock: number;
  status: "out_of_stock" | "restocking_soon" | "available_now";
  waitingList: ClientRequest[];
}

interface ClientRequest {
  id: string;
  name: string;
  email: string;
  requestDate: string;
  medication: string;
  phoneNumber: string;
  priority: "low" | "medium" | "higher";
}

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
};

@Component({
  selector: "home",
  templateUrl: "home.html",
  standalone: true,
  imports: [ImportsModule],
  providers: [],
})
export class Home implements OnInit {
  constructor(private cd: ChangeDetectorRef) {}

  selectedMedication: Medication | null = null;
  openWaitingListDialog(medication: Medication) {
    this.selectedMedication = medication;
    this.handleClientLargeDialog();
  }

  medications: Medication[];
  medicationsSelect: string[] = [];
  waitingList: ClientRequest[];

  menubarItems: MenuItem[];

  // Medication Dialog;
  medication: Medication = {
    id: "",
    name: "",
    price: 0,
    status: null,
    waitingList: null,
    quantityInStock: 0,
  };

  medicationDialogVisible: boolean = false;
  handleMedicationDialog() {
    this.medicationDialogVisible = !this.medicationDialogVisible;
  }

  clearMedicationInfos() {
    this.medicationDialogVisible = false;
    this.medication = {
      id: "",
      name: "",
      price: 0,
      status: null,
      waitingList: null,
      quantityInStock: 0,
    };

    this.cd.detectChanges();
  }

  saveMedicationInfos() {
    const inStockConditional =
      this.medication.status === "available_now" &&
      this.medication.quantityInStock > 0;

    const outOfStockConditional =
      (this.medication.status === "out_of_stock" ||
        this.medication.status === "restocking_soon") &&
      this.medication.quantityInStock === 0;

    if (this.medication.name !== "" && this.medication.price > 0) {
      if (inStockConditional || outOfStockConditional) {
        let tmp = localStorage.getItem("medications");
        if (tmp) {
          let prevMedications = JSON.parse(tmp);
          //Clients Waiting List will be working with FIFO or Queue (First In First Out);
          prevMedications = [this.medication, ...prevMedications];
          this.medications = prevMedications;
          localStorage.setItem("medications", JSON.stringify(prevMedications));
        } else {
          localStorage.setItem(
            "medications",
            JSON.stringify([this.medication])
          );

          this.medications = [this.medication];
        }

        this.medicationsSelect.push(this.medication.name);
        this.cd.detectChanges();
        this.clearMedicationInfos();
      }
    }
  }

  // Client Dialog
  client: ClientRequest = {
    id: "",
    name: "",
    email: "",
    priority: null,
    medication: "",
    phoneNumber: "",
    requestDate: null,
  };

  clientLargeDialogVisible: boolean = false;
  handleClientLargeDialog() {
    this.clientLargeDialogVisible = !this.clientLargeDialogVisible;
  }

  clientDialogVisible: boolean = false;
  handleClientDialog() {
    this.clientDialogVisible = !this.clientDialogVisible;
  }

  clearClientInfos() {
    this.handleClientDialog();
    this.client = {
      id: "",
      name: "",
      email: "",
      priority: null,
      medication: "",
      phoneNumber: "",
      requestDate: null,
    };

    this.cd.detectChanges();
  }

  saveClientInfos() {
    const phoneNumberRegExp =
      /^\+?\d{0,3}?\s?(\(?\d{2,4}\)?)?\s?\d{4,5}[-.\s]?\d{4}$/;
    const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const requestInfosCondition =
      this.client.medication && this.client.priority;

    const personalInfosCondition =
      this.client.email && this.client.email && this.client.phoneNumber;

    const validateWithRegExpConditions =
      phoneNumberRegExp.test(this.client.phoneNumber) &&
      emailRegExp.test(this.client.email);

    if (
      personalInfosCondition &&
      requestInfosCondition &&
      validateWithRegExpConditions
    ) {
      this.client.requestDate = formatDate(new Date());
      let tmp = localStorage.getItem("clients");

      if (tmp) {
        let prevClients = JSON.parse(tmp) as ClientRequest[];
        const clientAlreadyNoted = prevClients.find(
          (client) =>
            client.email === this.client.email ||
            client.phoneNumber === this.client.phoneNumber
        );

        if (!clientAlreadyNoted) {
          prevClients = [...prevClients, this.client];
          localStorage.setItem("clients", JSON.stringify(prevClients));
        }
      } else {
        localStorage.setItem("clients", JSON.stringify([this.client]));
      }

      const tmpMedications = localStorage.getItem("medications");
      let prevMedications = tmpMedications
        ? (JSON.parse(tmpMedications) as Medication[])
        : [];

      const prevMedicationWaitingListInIndexLocalStorage =
        prevMedications.findIndex(
          (medication) => this.client.medication === medication.name
        );

      if (prevMedicationWaitingListInIndexLocalStorage !== -1) {
        // Valor de Referência
        const selectedMedication =
          prevMedications[prevMedicationWaitingListInIndexLocalStorage];

        if (selectedMedication.waitingList) {
          prevMedications[
            prevMedicationWaitingListInIndexLocalStorage
          ].waitingList.push(this.client);
        } else {
          prevMedications[
            prevMedicationWaitingListInIndexLocalStorage
          ].waitingList = [this.client];
        }

        localStorage.setItem("medications", JSON.stringify(prevMedications));
        this.medications = prevMedications;
        this.clearClientInfos();
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.menubarItems = [
      {
        label: "Meu Estoque",
        icon: "pi pi-home",
      },
      {
        label: "Notificações",
        icon: "pi pi-whatsapp",
      },
      {
        label: "Suporte",
        icon: "pi pi-envelope",
      },
    ];

    const tmpMedications = localStorage.getItem("medications");
    const tmpClients = localStorage.getItem("clients");

    if (tmpMedications) this.medications = JSON.parse(tmpMedications);
    if (tmpClients) this.waitingList = JSON.parse(tmpClients);
    this.medications.map((medication) =>
      this.medicationsSelect.push(medication.name)
    );

    this.cd.detectChanges();
  }

  // Medication Utils
  stockSeverity(medication: Medication) {
    if (medication.quantityInStock === 0) return "danger";
    else if (medication.quantityInStock > 0 && medication.quantityInStock < 10)
      return "warn";
    else return "success";
  }

  availabilityClassification(medication: Medication) {
    if (medication.status === "out_of_stock") return "danger";
    else if (medication.status === "restocking_soon") return "warn";
    else return "success";
  }

  severityLabel(medication: Medication) {
    if (medication.status === "available_now") return "Em Estoque";
    else if (medication.status === "out_of_stock") return "Fora de Estoque";
    else return "Reposição em Breve";
  }

  filterByMedication(medication: Medication) {
    const data = this.waitingList.filter(
      (client) => client.medication === medication.name
    );

    return data;
  }

  overviewMeterGroup = [
    { label: "Em Estoque", color: "#34d399", value: 16, icon: "pi pi-table" },
    {
      label: "Reposição em Breve",
      color: "#fbbf24",
      value: 8,
      icon: "pi pi-inbox",
    },
    {
      label: "Fora de Estoque",
      color: "#f43f5e",
      value: 24,
      icon: "pi pi-cart-minus",
    },
  ];
}
