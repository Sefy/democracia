import { Component, forwardRef, Input } from '@angular/core';
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatInput } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from "@angular/material/autocomplete";

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
    MatIcon,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption
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

  @Input() autocomplete?: AutocompleteOptions;

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
