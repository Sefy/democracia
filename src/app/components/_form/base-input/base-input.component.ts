import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatInput } from "@angular/material/input";
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from "@angular/material/autocomplete";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { MatTooltip } from "@angular/material/tooltip";

export interface BaseSelectItem {
  id: number | string | null;
  name: string;
  title?: string;
}

interface AutocompleteOptions {
  loading?: boolean;
  options?: BaseSelectItem[];
}

@Component({
  selector: 'app-base-input',
  standalone: true,
  imports: [
    CommonModule,
    MatLabel,
    MatFormFieldModule,
    MatInput,
    FormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    IconComponent,
    MatTooltip
  ],
  templateUrl: './base-input.component.html',
  styleUrl: './base-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseInputComponent),
      multi: true
    }
  ]
})
export class BaseInputComponent implements ControlValueAccessor {

  @Input() label?: string;
  @Input() required = false;
  @Input() placeholder?: string;
  @Input() iconPrefix?: string;
  @Input() deleteBtnSuffix?: boolean;

  @Input() autocomplete?: AutocompleteOptions;

  @Output() delete = new EventEmitter();

  value: any;
  disabled = false;

  onChange!: (value: any) => void;
  onTouched!: () => void;

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _onChange(val: any) {
    this.writeValue(val);

    if (this.onChange) {
      this.onChange(val);
    }
  }
}
