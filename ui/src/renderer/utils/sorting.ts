export enum SortDirection {
  Ascending,
  Descending
}

function makeSortByKeyComparer(sortKey: string, sortDirection: SortDirection): (val1: any, val2: any) => number {
  const compareFn = (val1: any, val2: any): number => {
    let comparison;
    if (val1[sortKey] > val2[sortKey]) {
      comparison = 1;
    } else if (val1[sortKey] < val2[sortKey]) {
      comparison = -1;
    } else {
      comparison = 0;
    }

    if (sortDirection === SortDirection.Descending) {
      comparison = comparison * -1;
    }
    return comparison;
  };
  return compareFn;
}

export function sortObjectArrayByKey(array: any[], sortKey: string, sortDirection: SortDirection) {
  const compareFn = makeSortByKeyComparer(sortKey, sortDirection);
  array.sort(compareFn);
}
