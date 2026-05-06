# Scoring Rules v1

## Appearance

- 60+ minutes: 2 points
- 1-59 minutes: 1 point
- Did not play: 0 points

## Goal values

- Goalkeeper / Defender: 6 points
- Midfielder: 5 points
- Forward: 4 points

## Other events

- Assist: 3 points
- Clean sheet: 4 points for goalkeepers/defenders, 1 point for midfielders
- Every 3 saves: 1 point
- Yellow card: -1 point
- Red card: -3 points
- Bonus points: added directly from match feed

## Pipeline

- Player scores are calculated deterministically from one gameweek stat line.
- Team score is the sum of the selected squad's player scores.
- Overall ranking is the cumulative sum of closed/live gameweeks.
