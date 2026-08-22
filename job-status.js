/* ================================================================
   Silver Fox Dynamics — Careers: Job Closing Status
   Automatically marks job cards as CLOSED once their closing date
   has passed, evaluated strictly against Pakistan Standard Time
   (PKT / UTC+5) — never the visitor's local timezone.

   A job stays active through 11:59:59 PM PKT on its closing date and
   becomes closed starting 12:00:00 AM PKT the next day.

   Since PKT has a fixed, year-round UTC+5 offset (no DST), the exact
   UTC instant of "midnight PKT the day after the closing date" is:
     closingDate  19:00:00 UTC   (== closingDate + 1 day, 00:00 PKT)
   This is computed with Date.UTC()/Date.now(), both of which are
   timezone-agnostic (epoch milliseconds), so the comparison is
   correct regardless of where the visitor's browser is located.
================================================================ */
(function () {
  'use strict';

  var CHECK_INTERVAL_MS = 60 * 1000; // re-check every minute
  var PKT_MIDNIGHT_IN_UTC_HOURS = 19; // 00:00 PKT (next day) == 19:00 UTC (closing day)

  // Parse a "YYYY-MM-DD" string into the UTC epoch ms instant at
  // which the job should close (11:59:59 PM PKT on that date, i.e.
  // 12:00:00 AM PKT the following day). Returns null if the string
  // is missing, malformed, or not a real calendar date.
  function getClosingCutoffUTCms(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
    if (!match) return null;

    var year = parseInt(match[1], 10);
    var month = parseInt(match[2], 10);
    var day = parseInt(match[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    var cutoffUTCms = Date.UTC(year, month - 1, day, PKT_MIDNIGHT_IN_UTC_HOURS, 0, 0, 0);

    // Guard against invalid calendar dates (e.g. 2026-02-30), which
    // Date.UTC silently rolls over into the next month.
    var check = new Date(cutoffUTCms);
    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day
    ) {
      return null;
    }

    return cutoffUTCms;
  }

  function preventClosedClick(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function closeJobCard(card, applyLink) {
    if (card.classList.contains('job-closed')) return; // already handled

    card.classList.add('job-closed');
    card.setAttribute('aria-disabled', 'true');

    if (applyLink) {
      applyLink.classList.add('is-closed');
      applyLink.textContent = 'CLOSED';
      applyLink.setAttribute('aria-disabled', 'true');
      applyLink.setAttribute('tabindex', '-1');
      applyLink.removeAttribute('href');
      applyLink.addEventListener('click', preventClosedClick);
    }

    if (!card.querySelector('.job-closed-badge')) {
      var badge = document.createElement('span');
      badge.className = 'job-closed-badge';
      badge.textContent = 'Closed';
      card.appendChild(badge);
    }
  }

  function checkJobCard(card) {
    var cutoffUTCms = getClosingCutoffUTCms(card.getAttribute('data-closing-date'));

    // Missing/invalid closing date: leave the card exactly as-is
    // rather than risk breaking the page.
    if (cutoffUTCms === null) return;

    if (Date.now() >= cutoffUTCms) {
      closeJobCard(card, card.querySelector('.apply-link'));
    }
  }

  function checkAllJobCards() {
    var cards = document.querySelectorAll('.job-card[data-closing-date]');
    for (var i = 0; i < cards.length; i++) {
      checkJobCard(cards[i]);
    }
  }

  function init() {
    checkAllJobCards();
    setInterval(checkAllJobCards, CHECK_INTERVAL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
