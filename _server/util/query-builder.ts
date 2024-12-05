export interface OrderBy {
  column: string;
  direction: string;
}

export interface BaseFilters {
  count?: number;
  page?: number;
  sort?: OrderBy | string | OrderBy[] | string[];
}

export interface Join {
  join: string;
  left?: boolean;
}

export class QueryBuilder {
  private _select: string[] = [];
  private _from?: string;
  private params: any[] = [];
  private conditions: string[] = [];
  private joins: Join[] = [];
  private groupBy: string[] = [];

  constructor(
    protected filters?: BaseFilters
  ) {
  }

  // reset select to the single string passed
  select(select: string) {{
    this._select = [select];
    return this;
  }}

  addSelect(select: string) {
    this._select.push(select);
    return this;
  }

  from(from: string) {
    this._from = from;
    return this;
  }

  and(cond: string) {
    this.conditions.push(cond);
    return this;
  }

  addParam(val: any) {
    this.params.push(val);
    return this;
  }

  getCurrentParamIndex() {
    return '$' + (this.params.length + 1);
  }

  join(join: string) {
    if (!this.joins.some(j => j.join.includes(join))) {
      this.joins.push({join});
    }

    return this;
  }

  leftJoin(join: string) {
    if (!this.joins.some(j => j.join.includes(join))) {
      this.joins.push({join, left: true});
    }

    return this;
  }

  addGroupBy(groupBy: string) {
    this.groupBy.push(groupBy);
    return this;
  }

  getJoinQuery() {
    return this.joins.map(j => (j.left ? 'LEFT ' : '') + 'JOIN ' + j.join).join(' ');
  }

  getCondQuery(withWhere = true) {
    if (!this.conditions?.length) {
      return '';
    }

    return (withWhere ? ' WHERE ' : ' ') + this.conditions.join(' AND ');
  }

  // @TODO: move these util methods to QueryBuilder ?
  getLimitAndOffset() {
    if (!(this.filters?.count)) {
      return '';
    }

    return `LIMIT ${this.filters.count}` +
      (this.filters.page ? ` OFFSET ${this.filters.page * this.filters.count}` : '');
  }

  getGroupBy() {
    if (!this.groupBy?.length) {
      return '';
    }

    return 'GROUP BY ' + this.groupBy.join(', ');
  }

  getOrderBy() {
    if (!(this.filters?.sort)) {
      return '';
    }

    if (typeof this.filters.sort === 'string') {
      return 'ORDER BY ' + this.filters.sort;
    }

    if (Array.isArray(this.filters.sort)) {
      return 'ORDER BY ' + this.filters.sort.map(s => typeof s === 'string' ? s : s.column + ' ' + s.direction).join(', ');
    }

    // @TODO: bon, si besoin faire un genre de map entre nom de "propriété" (style name, etc), et nom de colonne .. ?
    return `ORDER BY ${this.filters.sort.column} ${this.filters.sort.direction ?? ''}`;
  }

  getQuery() {
    return [
      `SELECT ${this._select.join(', ')}`,
      `FROM ${this._from}`,
      this.getJoinQuery(),
      this.getCondQuery(),
      this.getGroupBy(),
      this.getOrderBy(),
      this.getLimitAndOffset()
    ].filter(part => !!part?.trim()).join(' ');
  }

  getParams() {
    return this.params;
  }
}
