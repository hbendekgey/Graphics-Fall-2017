This is the (almost) complete form of 1-player Puzzle League.
I worked on it for ~10 hours.

I implemented:
-6x12 grid with 5 gem types
-cursor to switch blocks which shrinks and grows
-can switch empty spaces with gems
-gravity pulls gems down
-ability to change gems while gems are disappearing elsewhere
-animated swapping
-ability to switch gems while they're falling (if a falling gem is switched with a non-falling gem this works perfectly. Currently swapping 2 falling gems can result in a bug)
-optimized by not checking every gem for removal/fall every frame, keeping track of them in a queue
-gems come up from bottom of the board, entering play once they've fully appeared on the screen

Notably (for the 1-player version) it's missing a few features:
-The game doesn't end once it hits the top,
-The speed doesn't increase, and
-There is a bug when two falling blocks are switched that causes weirdness.
