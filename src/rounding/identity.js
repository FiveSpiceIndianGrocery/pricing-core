// No cosmetic rounding; keep computed price as-is (in smallest units)
export default function identity(priceUnits /* bigint */) {
  return priceUnits;
}
