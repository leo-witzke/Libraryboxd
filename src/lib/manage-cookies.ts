import { writable } from 'svelte/store';

export const branch = writable("");
export const library = writable("");

function setCookie(name: string, value: string) {
    chrome.cookies.set({
            expirationDate: Date.now()/1000 + (365 * 24 * 60 * 60),
            name: name,
            value: value,
            url: "https://letterboxd.com/"
        }
    )
}

async function getCookie(name: string) {
    return chrome.cookies.get({
        name: name,
        url: "https://letterboxd.com/"
    });
}

export function setBranch(branch_: string) {
    setCookie("branch", branch_);
    branch.set(branch_);
}

export async function getBranch() {
    const branch_ = (await getCookie("branch"))?.value;
    if (branch_ != undefined) { branch.set(branch_); }
    return branch_;
}

export function setLibrary(library_: string) {
    setCookie("library", library_);
    library.set(library_);
    setBranch("");
}

export async function getLibrary() {
    const library_ = (await getCookie("library"))?.value;
    if (library_ != undefined) { library.set(library_); }
    return library_;
}

getBranch();
getLibrary();