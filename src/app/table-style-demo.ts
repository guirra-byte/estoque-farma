import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ImportsModule } from './imports';
import { Product } from '@/domain/product';
import { Medication, MedicineService } from '@service/productservice';
@Component({
  selector: 'table-style-demo',
  templateUrl: 'table-style-demo.html',
  standalone: true,
  imports: [ImportsModule],
  providers: [MedicineService],
})
export class TableStyleDemo implements OnInit {
  products!: Product[];

  //Medication Dialog;
  medication!: Medication;
  medicationDialogVisible: boolean;
  showMedicationDialog() {
    this.medicationDialogVisible = true;
  }

  saveMedicationInfos() {}

  constructor(
    private productService: MedicineService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.getProductsSmall().then((data) => {
      this.products = data;
      this.cd.markForCheck();
    });
  }

  rowClass(product: Product) {
    return {
      '!bg-primary !text-primary-contrast': product.category === 'Fitness',
    };
  }

  rowStyle(product: Product) {
    if (product.quantity === 0) {
      return { fontWeight: 'bold', fontStyle: 'italic' };
    }
  }

  stockSeverity(product: Product) {
    if (product.quantity === 0) return 'danger';
    else if (product.quantity > 0 && product.quantity < 10) return 'warn';
    else return 'success';
  }
}
