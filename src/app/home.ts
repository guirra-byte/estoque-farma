import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ImportsModule } from "./imports";
import { MenuItem } from "primeng/api";
import { MedicationService } from "../service/medication/medication-service";
import { formatDateUtil } from "../utils/format-date-util";
import { Medication } from "src/types/medication-type";

export interface ClientRequest {
  id: string;
  name: string;
  email: string;
  requestDate: string;
  medication: string;
  phoneNumber: string;
  priority: "low" | "medium" | "higher";
}

const hiddenClientValue = {
  id: "",
  name: "",
  email: "",
  priority: null,
  medication: "",
  phoneNumber: "",
  requestDate: null,
};
@Component({
  selector: "home",
  templateUrl: "home.html",
  standalone: true,
  imports: [ImportsModule],
  providers: [],
})
export class Home implements OnInit {
  constructor(
    private medicationService: MedicationService,
    private cd: ChangeDetectorRef
  ) {}

  /** ---------- Medication ----------- */
  // Lista de medicamentos e suas seleções;
  medications: Medication[] = [];
  medicationsSelect: string[] = [];
  selectedMedication: Medication | null = null;

  // Dados do medicamento atual;
  medication: Medication = {
    id: "",
    name: "",
    price: 0,
    status: null,
    waitingList: null,
    quantityInStock: 0,
  };

  // Controle de visibilidade do diálogo do medicamento;
  medicationDialogVisible: boolean = false;

  // Abrir ou fechar o diálogo de medicamentos;
  handleMedicationDialog() {
    this.medicationDialogVisible = !this.medicationDialogVisible;
  }

  // Limpar informações do medicamento e fechar o diálogo
  clearMedication() {
    this.handleMedicationDialog();
    this.medication = this.medicationService.clearMedication();
    this.cd.detectChanges();
  }

  // Salvar as informações do medicamento;
  saveMedicationInfos() {
    this.medicationService.saveMedication(this.medication);
    this.clearMedication();
  }

  // Classificar a severidade baseada na quantidade em estoque;
  stockSeverity(medication: Medication) {
    if (medication.quantityInStock === 0) return "danger";
    else if (medication.quantityInStock > 0 && medication.quantityInStock < 10)
      return "warn";
    else return "success";
  }

  // Classificar a disponibilidade do medicamento;
  availabilityClassification(medication: Medication) {
    if (medication.status === "out_of_stock") return "danger";
    else if (medication.status === "restocking_soon") return "warn";
    else return "success";
  }

  // Exibir o status de disponibilidade do medicamento;
  severityLabel(medication: Medication) {
    if (medication.status === "available_now") return "Em Estoque";
    else if (medication.status === "out_of_stock") return "Fora de Estoque";
    else return "Reposição em Breve";
  }
  /** ---------- Medication ----------- */

  openWaitingListDialog(medication: Medication) {
    this.selectedMedication = medication;
    this.handleClientLargeDialog();
  }

  waitingList: ClientRequest[];
  menubarItems: MenuItem[];

  // Client Dialog
  client: ClientRequest = hiddenClientValue;
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
    this.client = hiddenClientValue;
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
      this.client.requestDate = formatDateUtil(new Date());
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

    this.medicationService.medications$.subscribe((medications) => {
      this.medications = medications;
    });

    const tmpClients = localStorage.getItem("clients");
    if (tmpClients) this.waitingList = JSON.parse(tmpClients);
    this.medications.map((medication) =>
      this.medicationsSelect.push(medication.name)
    );

    this.cd.detectChanges();
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
