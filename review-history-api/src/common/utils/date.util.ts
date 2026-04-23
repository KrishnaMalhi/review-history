const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

function pktDateParts(date: Date) {
  const pkt = new Date(date.getTime() + PKT_OFFSET_MS);
  return {
    year: pkt.getUTCFullYear(),
    month: pkt.getUTCMonth(),
    day: pkt.getUTCDate(),
  };
}

export function toPKT(date: Date = new Date()): Date {
  return new Date(date.getTime() + PKT_OFFSET_MS);
}

export function isSameDay(a: Date, b: Date): boolean {
  const x = pktDateParts(a);
  const y = pktDateParts(b);
  return x.year === y.year && x.month === y.month && x.day === y.day;
}

export function isYesterday(a: Date, b: Date): boolean {
  const aPkt = toPKT(a);
  const bPkt = toPKT(b);
  const aDay = Date.UTC(aPkt.getUTCFullYear(), aPkt.getUTCMonth(), aPkt.getUTCDate());
  const bDay = Date.UTC(bPkt.getUTCFullYear(), bPkt.getUTCMonth(), bPkt.getUTCDate());
  return bDay - aDay === 24 * 60 * 60 * 1000;
}
