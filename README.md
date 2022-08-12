# Big Two

### Introduction
---
Big Two (also known as Dai Di in Cantonese) is a popular four-player card game where each player is dealt 13 cards and aims to be the first to empty one's hand of all cards.

### Link to Game
---
https://lekpeng96.github.io/big-2/

### Tech
---
- HTML
- CSS
- Javascript

### API used
---
The "Deck of Cards" API is used to shuffle and display the cards.

Link to API: http://deckofcardsapi.com/ 

### Approach
---
As I knew that the game would require a large number of functions, I decided to make use of OOP so that these functions could be better encapsulated within objects.

I started with a more manual implementation where all four players are controlled by the user. After ensuring that the game was running seamlessly, I added a class for "Computers" to allow the user to play with three computer players.

Upon the distribution of cards, the computer sorts and partitions its hand into five card combinations, pairs, and single cards. During its turn, it then goes through the cards in the appropriate category and plays the weakest valid set of cards. As this process does not take much time, I used AJAX so that the user is given time to see the cards played by the computer players.

### Difficulties faced
---
To simulate actual card game playing, I wanted to make the four player hands form a rectangle. As I was really struggling to rotate and translate the containers, I referenced from a Javascript mahjong implementation (https://github.com/Pomax/mahjong), and at the same time learnt about the benefits of css variables.

### Game instructions
---
Click "About" to understand the game rules and add your name if you wish, before clicking "Start game"!
 
### What I wish to do if I had more time
---
- Improve the styling
- Add a countdown for players to pass/play
- Use a modal instead of displaying in the center when the user makes an invalid move.
- Remove unnecessary steps such as the computer clicking on the pass and play buttons, as well as checking the validity of the computer's selection 
- Add responsive design for mobile playing
- Make computer players play smarter using reinforcement learning
