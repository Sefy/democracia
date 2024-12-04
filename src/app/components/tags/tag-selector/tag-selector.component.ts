import { Component, forwardRef, OnInit } from '@angular/core';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { TagData } from "@common/room";
import { TagListComponent } from "@app/components/tags/list/tag-list.component";
import { startWith, tap } from "rxjs";
import { TagService } from "@app/services/tag.service";
import { TagItemComponent } from "@app/components/tags/tag-item/tag-item.component";
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-tag-selector',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    FormsModule,
    MatChipsModule,
    MatAutocompleteModule,
    TagListComponent,
    ReactiveFormsModule,
    TagItemComponent,
    MatInput
  ],
  templateUrl: './tag-selector.component.html',
  styleUrl: './tag-selector.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagSelectorComponent),
      multi: true
    }
  ]
})
export class TagSelectorComponent implements OnInit, ControlValueAccessor {

  value?: TagData[];
  disabled = false;

  onChange?: (value: any) => void;
  onTouched!: () => void;

  searchControl = new FormControl('');

  tags?: TagData[];
  availableTags?: TagData[];
  filteredTags?: TagData[];

  constructor(
    private tagService: TagService
  ) {
    // @TODO: à priori stocker les Tags en cache dans ce Service
    // @TODO: (localStorage ? chaque refresh ? en tous cas devrait pas changer si souvent ...)
    this.tagService.getAll().pipe(
      tap(tags => this.tags = tags)
    ).subscribe(tags => this.refreshAvailable());
  }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      startWith(''),
    ).subscribe(value => this.refreshFiltered(value!));
  }

  refreshAvailable() {
    this.availableTags = this.tags?.filter(t => !this.isSelected(t));
    this.refreshFiltered();
  }

  isSelected(tag: TagData) {
    return this.value?.some(t => t.id === tag.id);
  }

  refreshFiltered(search?: string) {
    const filterValue = (typeof search === 'string' ? search : '').toLowerCase();

    this.filteredTags = (this.availableTags ?? []).filter(tag => tag.name.toLowerCase().includes(filterValue));
  }

  findAvailable(id: number) {
    return this.availableTags?.find(t => t.id === id);
  }

  addTag(selected: MatAutocompleteSelectedEvent) {
    const tag = this.findAvailable(selected.option.value);

    if (!tag) {
      return;
    }

    const tags = this.value ?? [];

    tags.push(tag);

    this._setValue(tags);

    this.removeTagFromAvailable(tag);
    this.searchControl.setValue('');
  }

  removeTagFromAvailable(tag: TagData) {
    this.availableTags = this.availableTags?.filter(t => t.id !== tag.id);
  }

  _setValue(value?: TagData[]) {
    this.writeValue(value);

    if (this.onChange) {
      this.onChange(value);
    }
  }

  deleteTag(tag: TagData) {
    const index = this.value?.findIndex(t => t.id === tag.id);

    if (index === undefined || index === -1) {
      return;
    }

    this.value?.splice(index, 1);
    this._setValue(this.value);
    this.refreshAvailable();
  }

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
}
