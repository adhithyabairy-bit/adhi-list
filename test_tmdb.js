const L_EXT = {te:/telugu|tollywood/i, hi:/hindi|bollywood/i, ta:/tamil|kollywood/i, ml:/malayalam/i, kn:/kannada/i};
const rawInput = "best sci fi movies in telugu";
let fLang = "en";
for (const [c, r] of Object.entries(L_EXT)) { if (r.test(rawInput)) { fLang = c; break; } }
console.log("fLang calculated:", fLang);

const API = 'https://api.themoviedb.org/3';
const KEY = 'c1cd3acb5ce781be73da25ba488876c3';

async function test() {
  const discUrl = `${API}/discover/movie?api_key=${KEY}&sort_by=vote_count.desc&page=1&with_original_language=${fLang}&with_genres=878`;
  const r = await fetch(discUrl);
  const data = await r.json();
  console.log("Discovery results:");
  data.results.slice(0, 5).forEach(m => console.log(m.title, "-> lang:", m.original_language));
}

test();
