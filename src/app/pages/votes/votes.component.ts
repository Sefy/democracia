import { Component } from '@angular/core';
import { VoteComponent } from "@app/components/vote/vote/vote.component";
import { CommonModule } from "@angular/common";
import { VotePub } from "@common/vote";
import { VoteFilters, VoteService } from "@app/services/vote.service";
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap } from "rxjs";
import { VoteListHeaderComponent } from "@app/components/vote/list-header/vote-list-header.component";
import { DialogService } from "@app/services/dialog.service";

@Component({
  selector: 'app-votes',
  imports: [
    CommonModule,
    VoteComponent,
    VoteListHeaderComponent
  ],
  templateUrl: './votes.component.html',
  styleUrl: './votes.component.scss'
})
export class VotesComponent {
  votes?: VotePub[];

  filters =  {} as VoteFilters;

  searchSubject = new Subject<string>();

  constructor(
    private voteService: VoteService,
    private dialogService: DialogService
  ) {
    this.reload().subscribe();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(search => this.filters.search = search),
      switchMap(() => this.reload())
    ).subscribe();
  }

  reload() {
    return this.voteService.getAll(this.filters).pipe(
      tap(data => this.votes = data)
    );
  }

  createVote() {
    this.dialogService.openVoteEdit().afterClosed().subscribe(res => {
      console.log('CERTES ? enculerie', res);

      if (res) {
        this.reload().subscribe();
      }
    })
  }
}
