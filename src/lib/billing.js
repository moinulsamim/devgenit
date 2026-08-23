export function computeNextDueDate(currentDueDate, cycle, anchorDay, anchorMonth) {
  const date = new Date(currentDueDate);

  if (cycle === 'WEEKLY') {
    date.setDate(date.getDate() + 7);
    return date;
  }

  if (cycle === 'MONTHLY') {
    let targetMonth = date.getMonth() + 1;
    let targetYear = date.getFullYear();
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const actualDay = Math.min(anchorDay, lastDayOfTargetMonth);
    return new Date(targetYear, targetMonth, actualDay);
  }

  if (cycle === 'YEARLY') {
    const targetYear = date.getFullYear() + 1;
    const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
    if (anchorMonth === 2 && anchorDay === 29 && !isLeap) {
      return new Date(targetYear, 1, 28);
    }
    return new Date(targetYear, anchorMonth - 1, anchorDay);
  }

  return null;
}

export function generateInvoiceNumber() {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${yyyymm}-${random}`;
}

// Jan 31 monthly -> Feb 28/29 -> Mar 31: anchorDay restores the 31st.
// Dec 31 monthly -> Jan 31: the year rolls over.
// Feb 29 yearly -> Feb 28 in a non-leap target year.