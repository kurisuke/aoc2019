# Advent of Code 2019 in Typescript

## Personal observations

__WARNING: SPOILERS AHEAD!__

- Day 1: setting up nvm, npm, tsc, tslint, ... was worse than solving
  the actual problem
- Day 2: this rudimentary VM begs to be extended...
- Day 3: lots of case wrangling for the intersection tests, but works
  very fast. A set / hashmap based solution would have been easier to
  write & read.
- Day 4: second part a little tricky. Brute forcing is good enough.
- Day 5: Intcode gets extended. Lots of busywork, no major hurdles.
- Day 6: need to do more work with graph structures. Had to research /
  check lots of algorithmic stuff.
- Day 7: more Intcode extension, refactoring and cleanup. Doing the
  machines' input / output sequentially worked out fine.
- Day 8: fun, especially the pretty printing stuff.
- Day 9: some headaches with the different addressing modes. Needed
  some fiddling. Praise to the sophisticated self-test program!
- Day 10: solution came easy (this time I used sets!), but later on I
  realised it's not computationally optimal. Nevertheless it ran fast
  enough. Part 2 needed some fiddling with the coordinates and angle
  calculation until I got it right.
- Day 11: Nice problem, again some pretty printing. Did some
  refactoring of Intcode. For the first time I like the way my
  TypeScript code looks.
