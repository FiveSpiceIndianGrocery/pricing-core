// Force an .99 ending (assumes 100 units = $1.00; i.e., 1 = cent).
// Always rounds UP to x.99 if not already there.
export default function charm99(priceUnits /* bigint */) {
  const hundred = 100n;
  const dollars = priceUnits / hundred;
  const cents = priceUnits % hundred;
  const target = dollars * hundred + 99n;  // x.99

  // if already at or below x.99, bump to x.99; otherwise go to next dollar's .99
  return target >= priceUnits ? target : (dollars + 1n) * hundred + 99n;
}
