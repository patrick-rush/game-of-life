# <h1 class="gradient">Conway's Game of Life</h1>

![alt text](README-assets/image.png)

<div>John Horton Conway's Game of Life (aka Life) is a cellular automaton that visualizes the evolution of state within a system.

The rules are as follows:

1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
1. Any live cell with two or three live neighbors lives on to the next generation.
1. Any live cell with more than three live neighbors dies, as if by overpopulation.
1. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

Click around to create your initial state, and then hit Start Game to get going. There are some initial states that can produce some fascinating outcomes. Read about them on [Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) or on [LifeWiki](https://conwaylife.com/wiki), Life's dedicated wiki.

The color of the living cells represents how much of the board is alive at that moment, with <span class="red">reddish brown</span> representing death, <span class="yellow">and each</span> <span class="green">color after</span> <span class="blue">representing more</span> <span class="violet">and more life</span>.

This version of Life is toroidal, with each of the edges virtually connected to one another, creating an infinitely repeating board effect.

I also have to shout-out by far the coolest visual representation of a toroidal Game of Life by Tim Hau, which you can check out [here](https://observablehq.com/@timhau/conways-game-of-life-on-a-torus). Beautifully done 👏🏼

---

---

<br>
This project was generated with <a href="https://github.com/angular/angular-cli">Angular CLI</a> version 17.3.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

##### Sorry GitHub folks, pardon the styles...

<style>
    :root{
    --red: hsl(5, 50%, 50%);
    --yellow: hsl(45, 50%, 50%);
    --green: hsl(80, 50%, 50%);
    --blue: hsl(200, 50%, 50%);
    --violet: hsl(270, 50%, 50%);
    }
    h1{
        font-size: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: lighter;
        font-family: monospace;
        text-transform: uppercase;
    }
    div{
        font-family: monospace;
    }
.red{ color: var(--red) !important;}
.yellow{ color: var(--yellow) !important;}
.green{ color: var(--green) !important;}
.blue{ color: var(--blue) !important;}
.violet{ color: var(--violet) !important;}
.gradient{
    background: linear-gradient(to right, var(--red), var(--red), var(--yellow), var(--green), var(--blue), var(--violet), var(--violet));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;

}
</style>
