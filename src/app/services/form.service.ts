import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";

type FormInputType = 'text' | 'number' | 'date' | 'time'; // etc ...
type FormControlType = 'input' | 'select' | 'date' | 'datetime';

export interface FormFieldDef {
  key: string;
  label?: string; // defaults to key|titlecase
  required?: boolean;
  validators?: ValidatorFn[]; // directly passed to FormControl
  value?: any;

  controlType?: FormControlType; // defaults to input
  inputType?: FormInputType;
}

export type FormField = string | FormFieldDef;

@Injectable({
  providedIn: 'root'
})
export class FormService {
  constructor() {
  }

  getFormGroup(fields: FormField[]) {
    const group = {} as { [key: string]: FormControl };

    this.getFormFieldsDefs(fields).forEach(f => group[f.key] = this.getFormControl(f));

    return new FormGroup(group);
  }

  getFormFieldsDefs(fields: FormField[]) {
    return fields.map(f => this.getFormFieldDef(f));
  }

  getFormFieldDef(field: FormField): FormFieldDef {
    return typeof field === 'string' ? {key: field} : field;
  }

  getFormControl(field: FormField) {
    const def = typeof field === 'string' ? {key: field} : field;

    if (def.required) {
      def.validators = (def.validators || []).concat(Validators.required);
    }

    return new FormControl(def.value, def.validators);
  }
}
