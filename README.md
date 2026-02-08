# Demanding Dodge Game

A precision top-down platformer inspired by games like [*The World's Hardest Game*](https://en.wikipedia.org/wiki/The_World%27s_Hardest_Game) and [*Undertale*](https://en.wikipedia.org/wiki/Undertale).

The objective is to offer a simple, browser-accessible, randomizable, and engaging platformer for contexts like [Archipelago](https://archipelago.gg/).

This game is free and open source! If you like what I'm doing, and want to support me, please feel free to [**support my Ko-fi**](https://ko-fi.com/conorobrien)!

## Cloning

This uses [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules); you may wish to `git clone --recurse-submodules`.

## Plans, Ideas

Aesthetic:
- Simple
- Geometric

Abilities (function like Charms in Hollow Knight or Badges in a Hat in Time, i.e., you can only equip a few at a time, and the amount you can equip at a given time can be expanded over time):
- Sneak (similar to SHIFT in Undertale, allows for fine-grained movement, e.g., in mazes)
- Hover (float above hazards or pits for a brief period)
- Sprint (move faster)
- Shield (you can take 1 hit per screen before dying; death resets your shield)
- Time Slow (temporarily slow hazards?)

Level design:
- Overall hub world connecting to subworlds
- Some subworlds are open by default (this can be randomized, perhaps), and you need a small amount of Coins to unlock further subworlds
- Each subworld has its own hub world, openly-connected to many level routes
- Each subworld converges (e.g. with keys and switches; varies between platforms) into a subworld boss fight
- There are coins in each level, and maybe abilities or ability fragments at the end of routes
    - Each coin can be randomized for a check?
- There is a big locked door requiring a lot of Coins, and is a gauntlet leading to a final boss fight

Subworlds:
- *Beginner world*, but with some routes soft-closed off with certain obstacles/hazards requiring progression to unlock
- *Ice world*: Featuring slippy physics (obligatory)
- *Treacherous world* with Chasms which require Hover; to improve routing/skilled gameplay:
    - Different combinations of items should be able to cross (perhaps only short) chasms
    - Initially, the Chasms are actually just fast-moving hazards, which can also be cleared using Sprint
- *Maze world*, requiring precise movement
- *Fire world*, testing a player's rhythm with time-based hazards (e.g. periodic jets of fire)

Boss fight:
- Dynamic stage

## TODOS (from 1/22/26)
- hazard path easing (e.g. spending more time on the path waypoints - a hazard polygon (say, N=5) which the player goes into and then out of)
- camera that moves with player in hub worlds, fixed camera for puzzle levels
- wall collider for optimization (with holes?)
- teleport pads
- N specific fragments (like Slay the Spire's, aesthetically) required to unlock final fight