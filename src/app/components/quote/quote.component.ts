import { Component } from '@angular/core';
import { MathUtil } from "@app/util/math-util";

interface Quote {
  text: string;
  author?: string;
}

@Component({
  selector: 'app-quote',
  imports: [],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss'
})
export class QuoteComponent {
  // @TODO: from backend, and let users suggest new ones :)

  quotes: Quote[] = [
    {
      text: 'Que la majorité silencieuse se fasse entendre'
    },
    {
      text: 'The only way to do great work is to love what you do.',
    },
    {
      text: 'If you tell the truth, you don\'t have to remember anything.',
    },
    {
      text: `Il n'y a pas de problème, il n'y a que des solutions`
    },
    {
      text: `Je vois ici les hommes les plus forts et les plus courageux que j'ai jamais vu ...`,
      author: 'Tyler Durden'
    },
    {
      text: "Inspiré des forums romains et des agoras grecques"
    }
    // {
    //   text: `I am not in danger Skyler, I am the one who knocks.`,
    //   author: 'Walter White'
    // }
  ];

  quote: Quote;

  constructor() {
    const index = Math.random() > .9 ? MathUtil.rand(0, this.quotes.length - 1) : 0;

    this.quote = this.quotes[index];
  }
}
