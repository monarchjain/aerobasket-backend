function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesBetween(startHHMM, endHHMM) {
  return toMinutes(endHHMM) - toMinutes(startHHMM);
}

module.exports = { toMinutes, minutesBetween };