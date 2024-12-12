import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { VoteOptionPub, VotePub } from "@common/vote";
import { CardComponent } from "@app/components/_global/card/card.component";
import { CardHeaderComponent } from "@app/components/_global/card/header/card-header.component";
import { CommonModule, DatePipe } from "@angular/common";
import { CardContentComponent } from "@app/components/_global/card/card-content/card-content.component";
import { MatButton } from "@angular/material/button";
import { DialogService } from "@app/services/dialog.service";
import { VoteService } from "@app/services/vote.service";

type VoteOptionWithPercent = VoteOptionPub & { percent: number };

@Component({
  selector: 'app-vote',
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    DatePipe,
    CardContentComponent,
    MatButton
  ],
  templateUrl: './vote.component.html',
  styleUrl: './vote.component.scss'
})
export class VoteComponent implements OnInit {
  @Input() vote!: VotePub;

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
  ) { }

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
      message: `Voulez vous voter "${option.title}" ?`
    }).afterClosed().subscribe(() => this.voteService.vote(this.vote, option));
  }
}
