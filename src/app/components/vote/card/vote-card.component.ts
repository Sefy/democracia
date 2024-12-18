import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VoteOptionPub, VotePub } from "@common/vote";
import { CardComponent } from "@app/components/_global/card/card.component";
import { CardHeaderComponent } from "@app/components/_global/card/header/card-header.component";
import { CommonModule, DatePipe } from "@angular/common";
import { CardContentComponent } from "@app/components/_global/card/card-content/card-content.component";
import { DialogService } from "@app/services/dialog.service";
import { VoteService } from "@app/services/vote.service";
import { IconComponent } from "@app/components/_global/icon/icon.component";
import { filter, switchMap, tap } from "rxjs";

type VoteOptionWithPercent = VoteOptionPub & { percent: number };

@Component({
  selector: 'app-vote-card',
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    DatePipe,
    CardContentComponent,
    IconComponent
  ],
  templateUrl: './vote-card.component.html',
  styleUrl: './vote-card.component.scss'
})
export class VoteCardComponent implements OnInit {
  @Input() vote!: VotePub;

  @Output() needsReload = new EventEmitter();

  options?: VoteOptionWithPercent[];
  totalVotes?: number;

  colors = [
    '#9b20d9',
    '#7010f9',
    '#4c46db',
    '#3667c9',
    '#1693b1',
    '#00f194',
  ];

  constructor(
    private dialogService: DialogService,
    private voteService: VoteService
  ) {
  }

  ngOnInit() {
    // this.totalHeight = this.el.offsetHeight;

    this.totalVotes = (this.vote.options ?? []).reduce((sum, option) => sum + (option.count || 0), 0);

    this.options = (this.vote.options ?? []).map(opt => ({
      ...opt,
      percent: this.totalVotes! > 0 ? ((opt.count || 0) / this.totalVotes!) * 100 : 0
    }));
  }

  select(option: VoteOptionPub, e: Event) {
    this.dialogService.confirm({
      title: 'A voté ?',
      message: `Voulez vous voter "${option.text}" ?`
    }).afterClosed().pipe(
      filter(confirmed => !!confirmed),
      switchMap(() => this.voteService.vote(this.vote, option)),
      tap(() => this.needsReload.emit())
    ).subscribe();
  }

  showVoteChart() {
    this.dialogService.openVoteDetail(this.vote);
  }
}
