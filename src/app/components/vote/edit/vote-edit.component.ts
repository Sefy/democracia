import { Component } from '@angular/core';
import { BaseInputComponent } from "@app/components/_form/base-input/base-input.component";
import { DialogHeaderComponent } from "@app/components/_dialog/dialog-header/dialog-header.component";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { MatButton } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { VotePub } from "@common/vote";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { VoteService } from "@app/services/vote.service";

@Component({
  selector: 'app-vote-edit',
  imports: [
    CommonModule,
    MatDialogModule,
    BaseInputComponent,
    DialogHeaderComponent,
    FormsModule,
    LoaderComponent,
    MatButton,
    ReactiveFormsModule,
    IconComponent
  ],
  templateUrl: './vote-edit.component.html',
  styleUrl: './vote-edit.component.scss'
})
export class VoteEditComponent {
  vote?: VotePub;

  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private voteService: VoteService,
    private dialogRef: MatDialogRef<any>
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      expirationDate: [''],
      options: this.fb.array([
        this.fb.group({text: ['Oui', Validators.required]}),
        this.fb.group({text: ['Non', Validators.required]}),
      ])
    });
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(this.fb.group({text: ['', Validators.required]}));
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  submit(e?: SubmitEvent) {
    console.log('Certes', this.form.value);

    if (e) {
      e.preventDefault();
    }

    if (this.form.valid) {
      this.loading = true
      this.voteService.createVote(this.form.value).subscribe(res => {
        this.loading = false;
        this.dialogRef.close(true);
      });
    } else {
      console.log('Formulaire invalide');
    }
  }
}
