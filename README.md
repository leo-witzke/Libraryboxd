# Libraryboxd
**Library/BiblioCommons integration for Letterboxd**

Adds disc icons to movie posters that direct you to the movie on your local librarie's site! Why rent when you can borrow.

Select your library system and branch then let the extension go to work. If your library has the movie in its system, there will be a clickable icon in the upper right hand corner of the poster as <img style="width: 30px; height: 30px" src="static/blu-ray.svg"> for Blu-ray and <img style="width: 30px; height: 30px" src="static/dvd.svg"> for DVD. The icon is faded out if your library has it, but its not currently avaliable at your branch.

![Example View of Extension](example-view.png)

### TODO
 * Clear cache when user changes branch or library (currently have to quit and reopen chrome)
 * Start adding icons before page finishes loading

### Svelte Dev Commands 
```
npm run dev
npm run build
```