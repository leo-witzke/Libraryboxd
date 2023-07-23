// function setCookie(name: string, value: string) {
//     chrome.cookies.set({
//             expirationDate: Date.now()/1000 + (365 * 24 * 60 * 60),
//             name: name,
//             value: value,
//             url: "https://letterboxd.com/"
//         }
//     )
// }

// async function getCookie(name: string) {
//     return chrome.cookies.get({
//         name: name,
//         url: "https://letterboxd.com/"
//     });
// }

// export function setBranch(branch: string) {
//     setCookie("branch", branch);
// }

// // export async function getBranch() {
// //     return (await getCookie("branch")).value
// // }

// export function setLibrary(library: string) {
//     setCookie("library", library);
// }

// // export async function getLibrary() {
// //     return (await getCookie("library")).value
// // }