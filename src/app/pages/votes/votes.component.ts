import { Component } from '@angular/core';
import { VoteComponent } from "@app/components/vote/vote/vote.component";
import { CommonModule } from "@angular/common";
import { VotePub } from "@common/vote";
import { VoteService } from "@app/services/vote.service";
import { tap } from "rxjs";
import { VoteListHeaderComponent } from "@app/components/vote/list-header/vote-list-header.component";

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

  constructor(
    private voteService: VoteService
  ) {
    this.load().subscribe();
  }

  load() {
    return this.voteService.getAll().pipe(
      tap(data => this.votes = data)
    );
  }
}
