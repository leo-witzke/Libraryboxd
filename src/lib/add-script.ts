import { getMovieAvailability } from '$lib/get-and-parse.ts';
import type { MovieAvailability, Availability } from '$lib/get-and-parse.ts';

let cachedFilms = new Map();
var dvdSVG = null;
var bluraySVG = null;

export async function executeScript(tabId: number) {
  chrome.scripting.executeScript({
    target : {tabId : tabId},
    func : gatherPosters,
  }).then(injectionResults => {
    addAvailability(tabId, injectionResults[0].result)
  });
}

async function addAvailability(tabId: number, filmsOnPage: FilmsOnPage) {

  function addMovieAvailability(movieAvailability: MovieAvailability) {
    chrome.scripting.executeScript({
      target : {tabId : tabId},
      func : addAvailabilityIcons,
      args : [movieAvailability, dvdSVG, bluraySVG],
    })
  }

  function addFilm(film) {
    console.log(cachedFilms)
    const cachedFilm = cachedFilms.get(film["title"]+" ("+film["year"]+")");
    if (cachedFilm != undefined) {
      addMovieAvailability(cachedFilm);
    } else {
      getMovieAvailability(film["title"],film["year"],film["boxdId"]).then(movieAvailability => {
        cachedFilms.set(film["title"]+" ("+film["year"]+")", movieAvailability);
        addMovieAvailability(movieAvailability);
      })
    }
  }

  function getHTMLAttribute(html: string, attribute: string): string {
    const match = html.match(attribute+'="([^"]+)"');
    if (match == null && match.length >= 2) {
      return ""
    } else {
      return match[1]
    }
  }

  async function addALazyLoadedFilm(film: Film) {
    const filmInfo = await (await fetch("https://letterboxd.com/ajax/poster/"+film.linkSlug+"/std/"+film.posterWidth+"x"+film.posterHeight)).text();
    addFilm({
      title: getHTMLAttribute(filmInfo, 'data-film-name'),
      year: getHTMLAttribute(filmInfo, 'data-film-release-year'),
      boxdId: film.boxdId,
      linkSlug: film.linkSlug,
      posterWidth: film.posterWidth,
      posterHeight: film.posterHeight,
    });
  }

  if (dvdSVG == null) {
    dvdSVG = await (await fetch('dvd.svg')).text();
  }
  if (bluraySVG == null) {
    bluraySVG = await (await fetch('blu-ray.svg')).text();
  }
  console.log(filmsOnPage);
  for (const film of filmsOnPage.filmsOnPage) {
    addFilm(film)
  }
  for (const film of filmsOnPage.lazyFilmsOnPage) {
    addALazyLoadedFilm(film)
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

  function addIcon(poster: Element) {
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

  if (movieAvailability != null) {
    const posters = document.querySelectorAll(".linked-film-poster[data-film-id=\""+movieAvailability.boxdId+"\"],.film-poster:not(.listitem)[data-film-id=\""+movieAvailability.boxdId+"\"]");
    for (const poster of posters) {
      if (poster.classList.contains("really-lazy-load")){
        const boxId = poster.getAttribute("data-film-id");
        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
            for (const child of mutation.target.childNodes) {
              if (child.nodeType == Node.ELEMENT_NODE) {
                if (child.getAttribute("data-film-id")==boxId && child.classList.contains("react-component")) {
                  addIcon(child);
                  observer.disconnect()
                }
              }
            }
          }
        };
        const observer = new MutationObserver(callback);
        observer.observe(poster.parentElement, {childList: true});
      }
      else {
        addIcon(poster);
      }
    }
  }
}

interface Film {
  title: string;
  year: string;
  boxdId: string;
  linkSlug: string;
  posterWidth: string;
  posterHeight: string;
}

interface FilmsOnPage {
  filmsOnPage: Array<Film>;
  lazyFilmsOnPage: Array<Film>;
}

function gatherPosters(): FilmsOnPage {
  const filmsOnPage: Array<Film> = [];
  const lazyFilmsOnPage: Array<Film> = [];
  
  function checkForFilm(film: Film): boolean {
    for (const filmInList of filmsOnPage.concat(lazyFilmsOnPage)) {
      if (filmInList.boxdId==film.boxdId) {
        return true;
      }
    }
  }
  
  for (const poster of document.querySelectorAll(".linked-film-poster,.film-poster:not(.listitem)")) {
    const film: Film = {
      title: poster.getAttribute("data-film-name"),
      year: poster.getAttribute("data-film-release-year"),
      boxdId: poster.getAttribute("data-film-id"),
      linkSlug: poster.getAttribute("data-film-slug"),
      posterWidth: poster.getAttribute("data-image-width"),
      posterHeight: poster.getAttribute("data-image-height"),
    }
    if (!(checkForFilm(film))) {
      if ((film["title"] == null) || (film["year"] == null)) {
        lazyFilmsOnPage.push(film)
      } else {
        filmsOnPage.push(film);
      }
    }
  }

  return { filmsOnPage: filmsOnPage, lazyFilmsOnPage: lazyFilmsOnPage }
}