import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ImportsModule } from "./imports";
import { MenuItem } from "primeng/api";
import { MedicationService } from "../service/medication/medication-service";
import { Medication } from "src/types/medication-type";
import { ClientService } from "@service/client/client-service";
import { ClientRequest } from "src/types/client-type";

const hiddenMedicationValue = {
  id: "",
  name: "",
  price: 0,
  status: null,
  waitingList: null,
  quantityInStock: 0,
};
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
  menubarItems: MenuItem[] = [
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

  constructor(
    private clientService: ClientService,
    private medicationService: MedicationService,
    private cd: ChangeDetectorRef
  ) {}

  /** ---------- Medication ----------- */
  // Lista de medicamentos e suas seleções;
  medications: Medication[] = [];
  medicationsSelect: string[] = [];
  selectedMedication: Medication | null = null;

  // Dados do medicamento atual;
  medication: Medication = hiddenMedicationValue;

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

  /** ---------- Client ----------- */
  waitingList: ClientRequest[];

  // Waiting List Dialog;
  openWaitingListDialog(medication: Medication) {
    this.selectedMedication = medication;
    this.handleClientLargeDialog();
  }
  // Client Dialog States
  client: ClientRequest = hiddenClientValue; // Propriedade para armazenar os dados do cliente
  clientDialogVisible: boolean = false; // Estado do modal de client
  clientLargeDialogVisible: boolean = false; // Estado do modal de client (grande)

  // Método para alternar o estado do "clientLargeDialog"
  handleClientLargeDialog() {
    this.clientLargeDialogVisible = !this.clientLargeDialogVisible;
  }

  // Método para alternar o estado do "clientDialog"
  handleClientDialog() {
    this.clientDialogVisible = !this.clientDialogVisible;
  }

  // Método para limpar os dados do cliente
  clearClient() {
    this.handleClientDialog(); // Fecha o dialog
    this.client = this.clientService.clearClient(); // Limpa os dados do cliente
    this.cd.detectChanges(); // Força a detecção de mudanças
  }

  // Método para salvar as informações do cliente
  saveClientInfos() {
    this.clientService.saveClient(this.client); // Salva os dados do cliente através do service
  }
  /** ---------- Client ----------- */

  async ngOnInit(): Promise<void> {
    this.medicationService.medications$.subscribe((medications) => {
      this.medications = medications;
      this.medications.map((medication) =>
        this.medicationsSelect.push(medication.name)
      );
    });

    this.clientService.clients$.subscribe((medications) => {
      this.medications = medications;
    });

    this.cd.detectChanges();
  }

  overviewMeterGroup = [
    { label: "Em Estoque", color: "#34d399", value: 16, icon: "pi pi-table" },
    {
      label: "Reposição em Breve",
      color: "#fbbf24",
      value: 30,
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
