export enum DataSizeUnit {
  Bytes = 'Bytes',
  KibiBytes = 'KibiBytes',
  MebiBytes = 'MebiBytes',
  GibiBytes = 'GibiBytes',
  TebiBytes = 'TebiBytes'
};

const DATA_SIZE_UNIT_TO_BYTES = {
  'Bytes': 1,
  'KibiBytes': 1024,
  'MebiBytes': 1024 * 1024,
  'GibiBytes': 1024 * 1024 * 1024,
  'TebiBytes': 1024 * 1024 * 1024
};

const DATA_SIZE_UNIT_TO_SUFFIX = {
  'Bytes': 'B',
  'KibiBytes': 'KiB',
  'MebiBytes': 'MiB',
  'GibiBytes': 'GiB',
  'TebiBytes': 'TiB'
};

export function formatDataSize(bytes: number, unit: DataSizeUnit, wholeNumber: boolean = false, roundToDigits: number | null = null): string {
  const scale =  DATA_SIZE_UNIT_TO_BYTES[unit];
  const suffix = DATA_SIZE_UNIT_TO_SUFFIX[unit];

  if (bytes === 0) return '0 ' + suffix;

  let sizeInUnit = bytes / scale;
  if (wholeNumber) {
    sizeInUnit = Math.ceil(sizeInUnit);
  } else if (roundToDigits !== null) {
    sizeInUnit = round(sizeInUnit, roundToDigits);
  }
  return Intl.NumberFormat().format(sizeInUnit) + ' ' + suffix;
}

export function formatDataSizeInLargetWholeUnit(bytes: number, roundToDigits: number | null = null): string {
  const unit = largestWholeDataSizeUnit(bytes);
  return formatDataSize(bytes, unit, false, roundToDigits);
}

function largestWholeDataSizeUnit(bytes: number): DataSizeUnit {
  let maxUnit = DataSizeUnit.Bytes;
  let maxScale = 1;
  for (let unit of Object.values(DataSizeUnit)) {
    const scale = DATA_SIZE_UNIT_TO_BYTES[unit];
    const isWhole = (bytes / scale) >= 1.0;
    if (isWhole && scale > maxScale) {
      maxUnit = unit;
      maxScale = scale;
    }
  }
  return maxUnit as DataSizeUnit;
}

export function round(value: number, digits: number): number {
  return Math.round((value + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits);
}
