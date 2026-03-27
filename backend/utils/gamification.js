const POINT_VALUES = {
  issueReported: 25,
  issueVerified: 25,
  issueResolved: 40,
  upvoteReceived: 1,
};

const VERIFIED_STATUSES = ['verified', 'assigned', 'in-progress', 'resolved', 'closed'];

function getStartOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getStartOfMonth(date = new Date()) {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function syncPointWindows(user, now = new Date()) {
  const weekStart = getStartOfWeek(now);
  const monthStart = getStartOfMonth(now);

  if (!user.weeklyWindowStart || user.weeklyWindowStart.getTime() !== weekStart.getTime()) {
    user.weeklyPoints = 0;
    user.weeklyWindowStart = weekStart;
  }

  if (!user.monthlyWindowStart || user.monthlyWindowStart.getTime() !== monthStart.getTime()) {
    user.monthlyPoints = 0;
    user.monthlyWindowStart = monthStart;
  }
}

function computeBadges(user) {
  const badges = [];

  if ((user.issuesReported || 0) >= 1 || user.points >= POINT_VALUES.issueReported) {
    badges.push('Starter');
  }
  if (user.points > 50 || user.issuesReported >= 3) {
    badges.push('Reporter');
  }
  if (user.verifiedIssuesCount > 5 || user.points >= 250) {
    badges.push('Trusted Citizen');
  }
  if (user.issuesResolved > 3) {
    badges.push('Problem Solver');
  }
  if (user.points >= 500 || user.issuesResolved >= 5 || user.verifiedIssuesCount >= 15) {
    badges.push('Top Contributor');
  }

  return badges;
}

function applyPoints(user, amount, now = new Date()) {
  syncPointWindows(user, now);
  user.points += amount;
  user.weeklyPoints += amount;
  user.monthlyPoints += amount;
  user.badges = computeBadges(user);
}

function canRewardVerifiedIssue(issue) {
  return VERIFIED_STATUSES.includes(issue.status);
}

async function awardVerificationPoints(user, issue, now = new Date()) {
  if (!user || issue.rewardedForVerification) {
    return false;
  }

  const amount = POINT_VALUES.issueReported + POINT_VALUES.issueVerified;
  user.verifiedIssuesCount += 1;
  applyPoints(user, amount, now);
  issue.rewardedForVerification = true;
  return true;
}

async function awardResolutionPoints(user, issue, now = new Date()) {
  if (!user || issue.rewardedForResolution || !issue.rewardedForVerification) {
    return false;
  }

  user.issuesResolved += 1;
  applyPoints(user, POINT_VALUES.issueResolved, now);
  issue.rewardedForResolution = true;
  return true;
}

async function awardUpvotePoints(user, issue, now = new Date()) {
  if (!user || !issue.rewardedForVerification || !canRewardVerifiedIssue(issue)) {
    return false;
  }

  applyPoints(user, POINT_VALUES.upvoteReceived, now);
  return true;
}

function formatLeaderboardEntry(user, rank, metric = 'points') {
  const score = metric === 'weeklyPoints'
    ? user.weeklyPoints
    : metric === 'monthlyPoints'
      ? user.monthlyPoints
      : metric === 'issuesReported'
        ? user.issuesReported
        : user.points;

  return {
    _id: user._id,
    name: user.name,
    avatar: user.avatar,
    points: user.points,
    weeklyPoints: user.weeklyPoints,
    monthlyPoints: user.monthlyPoints,
    issuesReported: user.issuesReported,
    issuesResolved: user.issuesResolved,
    verifiedIssuesCount: user.verifiedIssuesCount,
    badges: user.badges || [],
    rank,
    score,
  };
}

module.exports = {
  POINT_VALUES,
  getStartOfWeek,
  getStartOfMonth,
  syncPointWindows,
  computeBadges,
  applyPoints,
  canRewardVerifiedIssue,
  awardVerificationPoints,
  awardResolutionPoints,
  awardUpvotePoints,
  formatLeaderboardEntry,
};
