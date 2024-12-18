import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { VotePub } from "@common/vote";
import { VoteFilters, VoteService } from "@app/services/vote.service";
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap } from "rxjs";
import { VoteListHeaderComponent } from "@app/components/vote/list-header/vote-list-header.component";
import { DialogService } from "@app/services/dialog.service";
import { VoteCardComponent } from "@app/components/vote/card/vote-card.component";

@Component({
  selector: 'app-votes',
  imports: [
    CommonModule,
    VoteCardComponent,
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

  reloadOne(vote: VotePub) {
    this.voteService.getVote(vote.id).subscribe(data => {
      const index = this.votes!.findIndex(v => v.id === vote.id);

      this.votes!.splice(index, 1, data);
    });
  }

  createVote() {
    this.dialogService.openVoteEdit().afterClosed().subscribe(res => {
      console.log('CERTES ? enculerie', res);

      if (res) {
        this.reload().subscribe();
      }
    });
  }
}
