const cachedFilms = new Set();
var dvdSVG = null;
var bluraySVG = null;

async function getTabId(): Promise<number> {
  const tab = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab[0].id;
}

async function executeScript() {
  const tabID = await getTabId()
  chrome.scripting.executeScript({
    target : {tabId : tabID},
    func : gatherPosters,
  }).then(injectionResults => {
    addAvailability(injectionResults[0].result)
  });
}

async function addAvailability(filmsOnPage: Array<Film>) {
  if (dvdSVG == null) {
    dvdSVG = await (await fetch('static/dvd.svg')).text();
  }
  if (bluraySVG == null) {
    bluraySVG = await (await fetch('static/blu-ray.svg')).text();
  }
  console.log(filmsOnPage);
  for (const film of filmsOnPage) {
    getMovieAvailability(film["title"],film["year"]).then(movieAvailability => {
      getTabId().then(tabID =>
        chrome.scripting.executeScript({
          target : {tabId : tabID},
          func : addAvailabilityIcons,
          args : [movieAvailability, dvdSVG, bluraySVG],
        })
      )
    })
  }
}

function addAvailabilityIcons(movieAvailability: MovieAvailability, dvdIcon: string, blurayIcon: string) {
  function inSystem(availability: Availability): boolean {
    return availability["branchLink"] != "" || availability["libraryLink"] != "";
  }
  function linkedIcon(availability: Availability, iconSVG: string): Element {
    function cutOpacity(element: Element) {
      element.setAttribute("style",element.getAttribute("style")+" opacity: 0.5;");
    }
    const icon = document.createElement("a");
    icon.innerHTML = iconSVG;
    if (availability["branchLink"] != "") {
      icon.setAttribute("href",availability["branchLink"])
      if (!availability["atBranch"]) {
        cutOpacity(icon.firstElementChild);
      }
    } else if (availability["libraryLink"] != ""){
      icon.setAttribute("href",availability["libraryLink"])
      cutOpacity(icon.firstElementChild);
    } else {
      return null
    }
    return icon
  }
  if (movieAvailability != null) {
    const parser = new DOMParser();
    const posters = document.querySelectorAll(".linked-film-poster[data-film-name=\""+movieAvailability.title+"\"]");
    for (const poster of posters) {
      if (inSystem(movieAvailability["DVD"]) && inSystem(movieAvailability["BLURAY"])) {
        const halfDVD = linkedIcon(movieAvailability["DVD"], dvdIcon);
        halfDVD.firstElementChild.setAttribute("clip-path","polygon(0% 0%,50% 0%,50% 100%,0% 100%)");
        poster.append(halfDVD);
        const halfBLURAY = linkedIcon(movieAvailability["BLURAY"], blurayIcon);
        halfBLURAY.firstElementChild.setAttribute("clip-path","polygon(50% 0%,100% 0%,100% 100%,50% 100%)");
        poster.append(halfBLURAY);
      } else if (inSystem(movieAvailability["BLURAY"])) {
        poster.append(linkedIcon(movieAvailability["BLURAY"], blurayIcon));
      } else if (inSystem(movieAvailability["DVD"])) {
        poster.append(linkedIcon(movieAvailability["DVD"], dvdIcon));
      }
    }
  }
}

interface Film {
  title: string;
  year: string;
}

function gatherPosters(): Array<Film> {
  const filmsOnPage: Array<Film> = [];
  
  function checkForFilm(film: Film): boolean {
    for (const filmInList of filmsOnPage) {
      if (filmInList["title"]==film["title"] && filmInList["year"]==film["year"]) {
        return true;
      }
    }
  }
  
  for (const poster of document.getElementsByClassName("linked-film-poster")) {
    const film: Film = {
      title: poster.getAttribute("data-film-name"),
      year: poster.getAttribute("data-film-release-year")
    }
    if ((film["title"] != null) && (film["year"] != null) && !(checkForFilm(film))) {
      filmsOnPage.push(film);
    }
  }

  return filmsOnPage;
}

executeScript()