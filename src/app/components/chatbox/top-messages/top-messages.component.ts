import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {ClientRoomMessage} from "@app/services/chat.service";

@Component({
    selector: 'app-top-messages',
    imports: [
        CommonModule,
        MatTooltip,
        // HighchartsChartModule
    ],
    templateUrl: './top-messages.component.html',
    styleUrl: './top-messages.component.scss'
})
export class TopMessagesComponent implements OnChanges {
  // Highcharts: typeof Highcharts = Highcharts;

  @Input() messages?: ClientRoomMessage[];

  colors = [
    '#9b20d9',
    '#7010f9',
    '#4c46db',
    '#3667c9',
    '#1693b1',
    '#00f194',
  ];

  percents: number[] = [];

  ngOnChanges(changes: SimpleChanges) {
    // console.log('FDP ca marche toujours pas jimagine ...', changes);

    this.computePercents();
  }

  computePercents() {
    const totalLikes = this.messages?.map(m => m.likesCount).reduce((prev, next) => (prev || 0) + (next || 0), 0) || 0;

    this.percents = this.messages?.map(m => {
      // <= @TODO: complètement arbitraire, mais pour prendre plus de place ...
      // @TODO: Si le plus haut est < 50%, on peut multiplier par 2 ... trouver une formule
      return ((m.likesCount || 0) * 100 / totalLikes) * 2;
    }) || [];
  }

  trackById(index: number, item: ClientRoomMessage) {
    return item.id;
  }

  // chartOptions: Highcharts.Options = {
  //   chart: {
  //     backgroundColor: 'transparent',
  //     animation: {duration: 500}
  //   },
  //
  //   xAxis: {
  //     type: 'category',
  //     labels: {
  //       position3d: "chart"
  //     }
  //   },
  //
  //   yAxis: {
  //     opposite: true
  //   },
  //
  //   plotOptions: {
  //     series: {
  //     }
  //   },
  //
  //   series: [
  //     {
  //       type: 'bar',
  //       data: [
  //         ['JE VOUS AI COMPRIS.', 30],
  //         ['Tout cramer pour reconstruire', 20],
  //         ['Bonsoir', 12],
  //         ['Merde', 9]
  //       ],
  //       colors: [
  // '#9b20d9', '#9215ac', '#861ec9', '#7a17e6', '#7010f9', '#691af3',
  // '#6225ed', '#5b30e7', '#533be1', '#4c46db', '#4551d5', '#3e5ccf',
  // '#3667c9', '#2f72c3', '#277dbd', '#1f88b7', '#1693b1', '#0a9eaa',
  // '#03c69b', '#00f194'
  //       ]
  //     },
  //   ],
  // };
}
