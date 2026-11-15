import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "scripts", "data", "domain-seed.txt");
const EXISTING = join(ROOT, "src", "catalog", "data", "popular-sites.json");

const set = new Set();

function add(raw) {
  let d = String(raw).toLowerCase().trim();
  d = d.replace(/^https?:\/\//, "").replace(/^www\./, "");
  d = d.split("/")[0] ?? "";
  if (!d || !d.includes(".") || d.length > 80) return;
  if (!/^[a-z0-9.-]+\.[a-z]{2,24}$/i.test(d)) return;
  set.add(d);
}

const CORE = `
google.com youtube.com facebook.com instagram.com x.com twitter.com tiktok.com
reddit.com linkedin.com whatsapp.com messenger.com telegram.org discord.com
slack.com zoom.us teams.microsoft.com meet.google.com web.whatsapp.com
gmail.com outlook.com icloud.com proton.me yahoo.com aol.com hotmail.com
live.com msn.com bing.com duckduckgo.com brave.com ecosia.org startpage.com
wikipedia.org wikidata.org wikimedia.org archive.org github.com gitlab.com
bitbucket.org sourceforge.net npmjs.com pypi.org crates.io packagist.org
rubygems.org nuget.org docker.com kubernetes.io hashicorp.com terraform.io
ansible.com circleci.com travis-ci.com jenkins.io azure.com aws.amazon.com
cloud.google.com digitalocean.com linode.com vultr.com hetzner.com ovh.com
scaleway.com render.com railway.app fly.io heroku.com vercel.com netlify.com
cloudflare.com fastly.com akamai.com jsdelivr.com unpkg.com cdnjs.com
fontawesome.com fonts.google.com typekit.com myfonts.com dafont.com icons8.com
flaticon.com thenounproject.com heroicons.com lucide.dev feathericons.com
phosphoricons.com tabler.io remixicon.com mui.com antdesign.com chakra-ui.com
tailwindcss.com getbootstrap.com bulma.io purecss.io open-props.style
css-tricks.com smashingmagazine.com alistapart.com web.dev webpagetest.org
gtmetrix.com pagespeed.web.dev caniuse.com browserslist.dev babeljs.io
webpack.js.org rollupjs.org parceljs.org vitejs.dev esbuild.github.io swc.rs
turbo.build nx.dev pnpm.io yarnpkg.com bun.sh deno.com nodejs.org python.org
rust-lang.org go.dev kotlinlang.org swift.org dotnet.microsoft.com php.net
ruby-lang.org perl.org scala-lang.org haskell.org elixir-lang.org erlang.org
clojure.org fsharp.org ocaml.org julialang.org r-project.org mathworks.com
gnu.org fsf.org apache.org eclipse.org jetbrains.com visualstudio.com
code.visualstudio.com atom.io sublime-text.com notepad-plus-plus.org vim.org
neovim.io emacs.org vscode.dev replit.com codesandbox.io stackblitz.com
glitch.com codepen.io jsfiddle.net sqlfiddle.com db-fiddle.com regex101.com
regexr.com jsonformatter.org jsonlint.com jwt.io base64decode.org
urlencoder.org validator.w3.org developer.mozilla.org w3schools.com
geeksforgeeks.org tutorialspoint.com javatpoint.com programiz.com
freecodecamp.org theodinproject.com scrimba.com frontendmentor.io
leetcode.com hackerrank.com codeforces.com atcoder.jp topcoder.com spoj.com
projecteuler.net adventofcode.com exercism.org codewars.com codingame.com
edabit.com codecademy.com datacamp.com kaggle.com colab.research.google.com
huggingface.co paperswithcode.com arxiv.org biorxiv.org medrxiv.org ssrn.com
researchgate.net academia.edu scholar.google.com pubmed.ncbi.nlm.nih.gov
ncbi.nlm.nih.gov nature.com science.org cell.com pnas.org ieee.org acm.org
springer.com elsevier.com wiley.com tandfonline.com jstor.org mendeley.com
zotero.org overleaf.com ctan.org latex-project.org wolfram.com wolframalpha.com
desmos.com geogebra.org symbolab.com brilliant.org khanacademy.org coursera.org
edx.org udacity.com udemy.com skillshare.com masterclass.com pluralsight.com
teamtreehouse.com duolingo.com memrise.com babbel.com rosettastone.com
busuu.com italki.com preply.com cambly.com hellotalk.com tandem.net
hinative.com forvo.com wordreference.com linguee.com reverso.net
collinsdictionary.com oxfordlearnersdictionaries.com dictionary.cambridge.org
merriam-webster.com macmillandictionary.com ldoceonline.com ahdictionary.com
urbandictionary.com thesaurus.com goodreads.com librarything.com
openlibrary.org worldcat.org gutenberg.org standard-ebooks.com scribd.com
audible.com libbyapp.com overdrive.com hoopladigital.com kanopy.com
spotify.com podcasts.apple.com stitcher.com pocketcasts.com overcast.fm
castbox.fm radiopublic.com anchor.fm buzzsprout.com libsyn.com megaphone.fm
simplecast.com spreaker.com podbean.com soundcloud.com bandcamp.com
mixcloud.com audiomack.com tidal.com deezer.com pandora.com iheart.com
siriusxm.com last.fm discogs.com allmusic.com rateyourmusic.com genius.com
musixmatch.com azlyrics.com whosampled.com setlist.fm bandsintown.com
songkick.com ticketmaster.com stubhub.com seatgeek.com vividseats.com
eventbrite.com meetup.com residentadvisor.net dice.fm timeout.com yelp.com
tripadvisor.com zomato.com opentable.com resy.com exploretock.com thefork.com
foursquare.com happycow.net allrecipes.com foodnetwork.com epicurious.com
bonappetit.com seriouseats.com tasty.co bbcgoodfood.com delish.com
eatingwell.com myrecipes.com yummly.com supercook.com cookpad.com
instacart.com doordash.com ubereats.com grubhub.com seamless.com
deliveroo.com just-eat.com thuisbezorgd.nl lieferando.de wolt.com
too-good-to-go.com hellofresh.com blueapron.com factor75.com gousto.co.uk
mindfulchef.com cvs.com walgreens.com riteaid.com boots.com
lloydspharmacy.com docmorris.de shop-apotheke.com goodrx.com singlecare.com
honey.com rakuten.com retailmenot.com coupons.com groupon.com slickdeals.net
qvc.com hsn.com zulily.com woot.com drop.com kickstarter.com indiegogo.com
gofundme.com justgiving.com donorbox.org venmo.com cash.app zellepay.com
square.com clover.com toasttab.com lightspeedhq.com
borger.dk skat.dk virk.dk sundhed.dk mitid.dk e-boks.dk postnord.dk dsb.dk
rejseplanen.dk jobindex.dk jobnet.dk boligsiden.dk boliga.dk dba.dk
guloggratis.dk bilbasen.dk dr.dk tv2.dk politiken.dk berlingske.dk bt.dk
ekstrabladet.dk information.dk finans.dk dmi.dk yr.no nordea.dk
danskebank.dk jyskebank.dk sydbank.dk mobilepay.dk lunar.app coop.dk
nemlig.com elgiganten.dk power.dk proshop.dk coolshop.dk zalando.dk ikea.dk
bilka.dk foetex.dk netto.dk rema1000.dk lidl.dk bibliotek.dk ku.dk au.dk
dtu.dk sdu.dk aau.dk cbs.dk fdm.dk apoteket.dk min.medicin.dk version2.dk
computerworld.dk prosa.dk ida.dk hk.dk 3f.dk atp.dk pfa.dk danica.dk
pensiondanmark.com trafikstyrelsen.dk vejdirektoratet.dk gls.dk dao.as
bring.com posten.no postnord.se postnl.nl deutschepost.de dhl.de
hermesworld.com evri.com yodel.co.uk skyscanner.dk momondo.com kayak.dk
booking.dk airbnb.dk just-eat.dk hungry.dk calculator.net
omnicalculator.com unitconverters.net convertio.co smallpdf.com ilovepdf.com
pdf24.org tinypng.com squoosh.app remove.bg ezgif.com cloudconvert.com
freeconvert.com online-convert.com temp-mail.org 10minutemail.com
whatismyipaddress.com draw.io diagrams.net excalidraw.com carbon.now.sh
openai.com chatgpt.com claude.ai perplexity.ai gemini.google.com
copilot.microsoft.com anthropic.com midjourney.com stability.ai
character.ai poe.com news.ycombinator.com producthunt.com dev.to
hashnode.com dribbble.com behance.net artstation.com deviantart.com
flickr.com imgur.com giphy.com tenor.com unsplash.com pexels.com
photopea.com pixlr.com canva.com figma.com miro.com notion.so obsidian.md
todoist.com evernote.com asana.com trello.com monday.com clickup.com
basecamp.com hubspot.com salesforce.com mailchimp.com sendgrid.com
twilio.com zendesk.com intercom.com freshdesk.com godaddy.com namecheap.com
bluehost.com siteground.com backblaze.com amazon.com amazon.co.uk amazon.de
amazon.fr amazon.es amazon.it amazon.ca amazon.com.au amazon.co.jp ebay.com
ebay.co.uk ebay.de ebay.fr aliexpress.com alibaba.com walmart.com target.com
costco.com bestbuy.com homedepot.com lowes.com ikea.com etsy.com shopify.com
temu.com shein.com wish.com zalando.com asos.com zara.com hm.com uniqlo.com
nike.com adidas.com puma.com booking.com airbnb.com expedia.com
tripadvisor.com kayak.com skyscanner.net uber.com lyft.com paypal.com
stripe.com wise.com revolut.com coinbase.com binance.com robinhood.com
netflix.com hulu.com disneyplus.com primevideo.com max.com crunchyroll.com
vimeo.com dailymotion.com imdb.com rottentomatoes.com nytimes.com bbc.com
cnn.com theguardian.com reuters.com forbes.com bloomberg.com wsj.com
washingtonpost.com npr.org foxnews.com apple.com microsoft.com office.com
maps.google.com drive.google.com docs.google.com translate.google.com
calendar.google.com pinterest.com snapchat.com threads.net bsky.app
tumblr.com quora.com medium.com substack.com baidu.com yandex.ru vk.com
weibo.com qq.com taobao.com tmall.com jd.com naver.com daum.net kakao.com
line.me rakuten.co.jp yahoo.co.jp nicovideo.jp pixiv.net mercari.com
craigslist.org indeed.com glassdoor.com monster.com ziprecruiter.com
patreon.com gumroad.com steamcommunity.com store.steampowered.com
epicgames.com xbox.com playstation.com roblox.com minecraft.net ea.com
ubisoft.com ign.com gamespot.com webmd.com mayoclinic.org healthline.com
nhs.uk who.int cdc.gov medlineplus.gov usa.gov gov.uk europa.eu un.org
nasa.gov nih.gov irs.gov weather.com accuweather.com timeanddate.com
worldtimebuddy.com speedtest.net fast.com haveibeenpwned.com 1password.com
bitwarden.com lastpass.com nordvpn.com expressvpn.com signal.org
grammarly.com
techcrunch.com wired.com theverge.com arstechnica.com engadget.com
gizmodo.com mashable.com cnet.com zdnet.com pcmag.com tomshardware.com
anandtech.com techradar.com digitaltrends.com androidcentral.com
gsmarena.com phonearena.com xda-developers.com macrumors.com 9to5mac.com
9to5google.com androidauthority.com windowscentral.com howtogeek.com
lifehacker.com makeuseof.com tomsguide.com pcworld.com computerworld.com
infoworld.com networkworld.com cio.com csoonline.com darkreading.com
krebsonsecurity.com schneier.com troyhunt.com virustotal.com
malwarebytes.com kaspersky.com norton.com mcafee.com avast.com avg.com
eset.com bitdefender.com sophos.com crowdstrike.com paloaltonetworks.com
fortinet.com checkpoint.com okta.com auth0.com duo.com pingidentity.com
onelogin.com jumpcloud.com beyondtrust.com cyberark.com vaultproject.io
consul.io nomadproject.io packer.io vagrantup.com saltproject.io
prometheus.io grafana.com influxdata.com elastic.co splunk.com
datadoghq.com newrelic.com dynatrace.com appdynamics.com sentry.io
bugsnag.com rollbar.com raygun.com logrocket.com fullstory.com hotjar.com
crazyegg.com optimizely.com vwo.com abtasty.com launchdarkly.com split.io
flagsmith.com unleash.io amplitude.com mixpanel.com heap.io posthog.com
plausible.io matomo.org analytics.google.com tagmanager.google.com
segment.com mparticle.com rudderstack.com snowflake.com databricks.com
clickhouse.com duckdb.org sqlite.org postgresql.org mysql.com mariadb.org
mongodb.com redis.io neo4j.com arangodb.com cockroachlabs.com
planetscale.com supabase.com firebase.google.com appwrite.io nhost.io
hasura.io prisma.io drizzle.team typeorm.io sequelize.org knexjs.org
mongoosejs.com djangoproject.com fastapi.tiangolo.com starlette.io
uvicorn.org gunicorn.org celeryproject.org rabbitmq.com kafka.apache.org
pulsar.apache.org nats.io zeromq.org memcached.org varnish-cache.org
nginx.org caddy.community traefik.io envoyproxy.io istio.io linkerd.io
etcd.io coredns.io unbound.net pi-hole.net adguard.com nextdns.io
cloudflare-dns.com quad9.net opendns.com dns.google mozilla.org
firefox.com chrome.google.com chromium.org opera.com vivaldi.com
torproject.org edge.microsoft.com safari.apple.com webkit.org whatwg.org
w3.org ietf.org rfc-editor.org iana.org icann.org whois.com name.com
hover.com gandi.net porkbun.com cloudns.net dnsimple.com bunny.net
keycdn.com stackpath.com cdn77.com cachefly.com lumen.com cogentco.com
he.net ntt.com telia.com telenor.com telia.dk tdc.dk yousee.dk stofa.dk
fastspeed.dk fiberby.dk energi.dk ok.dk ewii.dk seas-nv.dk nrgi.dk
andel.dk verdo.com hofor.dk orsted.com vestas.com siemens.com
siemens-energy.com ge.com abb.com schneider-electric.com bosch.com
philips.com panasonic.com lg.com tcl.com hisense.com xiaomi.com
huawei.com oppo.com vivo.com oneplus.com realme.com motorola.com
nokia.com blackberry.com htc.com asus.com acer.com lenovo.com dell.com
hp.com msi.com gigabyte.com asrock.com corsair.com razer.com logitech.com
steelseries.com hyperx.com kingston.com crucial.com western-digital.com
seagate.com toshiba.com sandisk.com
`;

for (const part of CORE.trim().split(/\s+/)) add(part);

const BRANDS = `
google youtube facebook instagram whatsapp tiktok reddit linkedin twitter
amazon ebay apple microsoft netflix spotify twitch pinterest tumblr snapchat
discord telegram slack zoom dropbox adobe salesforce oracle ibm intel nvidia
samsung sony nike adidas walmart target costco bestbuy homedepot lowes ikea
etsy shopify wordpress wix squarespace godaddy cloudflare github gitlab
bitbucket stackoverflow medium substack quora wikipedia bbc cnn nytimes
guardian reuters forbes bloomberg wsj npr foxnews msn yahoo bing duckduckgo
baidu yandex weibo taobao tmall alibaba aliexpress temu shein wish zalando
asos zara uniqlo gap nordstrom macys sephora ulta booking airbnb expedia
tripadvisor kayak skyscanner uber lyft paypal stripe wise revolut coinbase
binance robinhood chase wellsfargo bankofamerica capitalone mastercard
discover schwab fidelity vanguard tradingview investing marketwatch cnbc
coingecko coinmarketcap kraken klarna affirm afterpay fedex ups usps dhl
royalmail postnord ryanair easyjet norwegian lufthansa airfrance emirates
united delta southwest amtrak trainline rome2rio citymapper waze mapbox
openstreetmap tomtom weather accuweather timeanddate speedtest nordvpn
expressvpn surfshark proton bitwarden lastpass dashlane signal grammarly
notion obsidian todoist evernote asana trello monday clickup basecamp
hubspot mailchimp sendgrid twilio zendesk intercom freshdesk digitalocean
linode vultr hetzner backblaze vercel netlify heroku render railway
supabase firebase mongodb redis elastic datadog newrelic sentry pagerduty
jira confluence figma canva miro sketch invision framer webflow bubble
airtable coda typeform surveymonkey calendly doodle worldtimebuddy
regex101 jsonformatter codepen jsfiddle replit codesandbox stackblitz
leetcode hackerrank codeforces codewars exercism freecodecamp udemy
coursera skillshare masterclass duolingo khanacademy quizlet ankiweb
chess lichess roblox minecraft steam epicgames xbox playstation
webmd mayoclinic healthline goodrx cvs walgreens boots pfizer moderna
doordash ubereats grubhub deliveroo justeat wolt hellofresh blueapron
instacart craigslist indeed glassdoor monster ziprecruiter patreon gumroad
kickstarter indiegogo gofundme producthunt dribbble behance artstation
deviantart flickr imgur giphy unsplash pexels photopea tinypng squoosh
ilovepdf smallpdf convertio cloudconvert ezgif calculator omnicalculator
haveibeenpwned tempmail drawio excalidraw archive britannica dictionary
thesaurus deepl wiktionary scholar pubmed arxiv nature science springer
elsevier wiley jstor researchgate academia mendeley zotero overleaf
wolfram desmos geogebra symbolab brilliant projecteuler stackexchange
brainly chegg coursehero studocu memrise babbel rosettastone busuu
italki preply forvo wordreference linguee reverso collins oxford
cambridge merriam macmillan goodreads librarything openlibrary worldcat
gutenberg scribd audible spotify podcast stitcher pocketcasts overcast
soundcloud bandcamp tidal deezer pandora lastfm discogs allmusic genius
musixmatch ticketmaster stubhub seatgeek eventbrite meetup timeout yelp
tripadvisor zomato opentable resy foursquare happycow allrecipes
foodnetwork epicurious bonappetit seriouseats tasty delish eatingwell
yummly supercook cookpad instacart doordash ubereats grubhub deliveroo
justeat wolt hellofresh blueapron cvs walgreens boots goodrx honey
rakuten groupon slickdeals qvc hsn zulily woot drop kickstarter
indiegogo gofundme venmo square clover toasttab lightspeed
techcrunch wired theverge arstechnica engadget gizmodo mashable cnet
zdnet pcmag tomshardware anandtech techradar digitaltrends gsmarena
macrumors howtogeek lifehacker makeuseof tomsguide pcworld
virustotal malwarebytes kaspersky norton mcafee avast avg eset
bitdefender sophos crowdstrike fortinet checkpoint okta auth0 duo
prometheus grafana influxdata elastic splunk datadog newrelic dynatrace
sentry bugsnag rollbar hotjar optimizely launchdarkly amplitude mixpanel
posthog plausible matomo segment snowflake databricks clickhouse duckdb
sqlite postgresql mysql mariadb mongodb redis neo4j cockroach
planetscale supabase firebase prisma drizzle typeorm sequelize
fastapi starlette uvicorn gunicorn celery rabbitmq kafka pulsar nats
memcached varnish nginx traefik envoy istio linkerd etcd coredns
pihole adguard nextdns mozilla firefox chromium opera vivaldi
torproject webkit whatwg ietf icann whois hover gandi porkbun bunny
keycdn stackpath lumen cogent siemens bosch philips panasonic
xiaomi huawei oppo vivo oneplus realme motorola nokia asus acer
lenovo dell corsair razer logitech kingston crucial seagate toshiba
sandisk western-digital
`.trim().split(/\s+/);

for (const b of BRANDS) {
  const clean = b.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (clean.length >= 2) add(`${clean}.com`);
}

const WIKI = "en da de fr es it nl sv no fi pl pt ru ja zh ko ar hi tr cs hu ro uk el he th vi id ms hr sk sl bg sr lt lv et is ga cy eu ca gl af sw".split(" ");
for (const c of WIKI) add(`${c}.wikipedia.org`);

const GLDS = "com co.uk de fr es it nl se no dk fi pl cz at ch be ie pt gr ro hu com.au co.nz co.jp co.kr com.br com.mx ca in co.in com.sg com.hk com.tw com.tr co.za com.ar cl com.co".split(" ");
for (const g of GLDS) add(`google.${g}`);
for (const g of "com co.uk de fr es it ca com.au co.jp".split(" ")) add(`amazon.${g}`);
for (const g of "com co.uk de fr it es ca com.au".split(" ")) add(`ebay.${g}`);

const GOOG = `
mail.google.com drive.google.com docs.google.com sheets.google.com
slides.google.com forms.google.com sites.google.com photos.google.com
maps.google.com news.google.com play.google.com store.google.com
books.google.com scholar.google.com translate.google.com
calendar.google.com meet.google.com chat.google.com keep.google.com
earth.google.com fonts.google.com cloud.google.com firebase.google.com
developers.google.com support.google.com policies.google.com
myaccount.google.com admin.google.com workspace.google.com one.google.com
pay.google.com ads.google.com analytics.google.com tagmanager.google.com
images.google.com video.google.com youtu.be music.youtube.com
studio.youtube.com tv.youtube.com
`.trim().split(/\s+/);
for (const d of GOOG) add(d);

const MS = `
microsoft.com office.com office365.com microsoft365.com live.com
outlook.com hotmail.com msn.com bing.com xbox.com skype.com
onedrive.live.com sharepoint.com teams.microsoft.com azure.microsoft.com
visualstudio.com github.com linkedin.com activision.com blizzard.com
minecraft.net
`.trim().split(/\s+/);
for (const d of MS) add(d);

const APPLE = `
apple.com icloud.com me.com mac.com itunes.com developer.apple.com
support.apple.com music.apple.com tv.apple.com podcasts.apple.com
books.apple.com maps.apple.com
`.trim().split(/\s+/);
for (const d of APPLE) add(d);

const UNIS = `
harvard.edu mit.edu stanford.edu berkeley.edu yale.edu princeton.edu
columbia.edu uchicago.edu upenn.edu caltech.edu cornell.edu duke.edu
northwestern.edu jhu.edu brown.edu dartmouth.edu vanderbilt.edu rice.edu
emory.edu georgetown.edu cmu.edu nyu.edu usc.edu ucla.edu ucsd.edu
uci.edu ucsb.edu ucdavis.edu umich.edu uiuc.edu wisc.edu umn.edu
utexas.edu gatech.edu purdue.edu osu.edu psu.edu ufl.edu unc.edu
virginia.edu umd.edu bu.edu northeastern.edu tufts.edu brandeis.edu
rochester.edu case.edu wustl.edu ox.ac.uk cam.ac.uk imperial.ac.uk
ucl.ac.uk lse.ac.uk edinburgh.ac.uk manchester.ac.uk bristol.ac.uk
warwick.ac.uk glasgow.ac.uk kcl.ac.uk soton.ac.uk leeds.ac.uk
sheffield.ac.uk nottingham.ac.uk birmingham.ac.uk exeter.ac.uk york.ac.uk
durham.ac.uk st-andrews.ac.uk ethz.ch epfl.ch uzh.ch unige.ch unibas.ch
tum.de lmu.de hu-berlin.de fu-berlin.de uni-heidelberg.de kit.edu
rwth-aachen.de tu-berlin.de uni-bonn.de uni-hamburg.de uni-koeln.de
uni-frankfurt.de sorbonne-universite.fr psl.eu polytechnique.edu ens.fr
sciencespo.fr hec.edu inria.fr cnrs.fr cea.fr ku.dk au.dk dtu.dk sdu.dk
aau.dk ruc.dk cbs.dk itu.dk ki.se uu.se lu.se kth.se chalmers.se su.se
gu.se liu.se umu.se ltu.se uio.no ntnu.no uib.no uit.no nmbu.no
oslomet.no helsinki.fi aalto.fi utu.fi jyu.fi tuni.fi oulu.fi lut.fi
uva.nl tudelft.nl tue.nl utwente.nl rug.nl leidenuniv.nl vu.nl eur.nl
maastrichtuniversity.nl ugent.be kuleuven.be ulb.be uclouvain.be
uantwerpen.be unam.mx usp.br unicamp.br ufrj.br ufmg.br unesp.br
puc-rio.br ita.br tsinghua.edu.cn pku.edu.cn fudan.edu.cn sjtu.edu.cn
zju.edu.cn nju.edu.cn ustc.edu.cn hit.edu.cn buaa.edu.cn ruc.edu.cn
u-tokyo.ac.jp kyoto-u.ac.jp osaka-u.ac.jp tohoku.ac.jp nagoya-u.ac.jp
kyushu-u.ac.jp hokudai.ac.jp tokyo-tech.ac.jp waseda.jp keio.ac.jp
nus.edu.sg ntu.edu.sg smu.edu.sg suss.edu.sg sutd.edu.sg hku.hk
cuhk.edu.hk ust.hk polyu.edu.hk cityu.edu.hk anu.edu.au unimelb.edu.au
sydney.edu.au unsw.edu.au uq.edu.au monash.edu uwa.edu.au adelaide.edu.au
utas.edu.au rmit.edu.au uts.edu.au qut.edu.au deakin.edu.au griffith.edu.au
macquarie.edu.au uottawa.ca utoronto.ca mcgill.ca ubc.ca ualberta.ca
uwaterloo.ca queensu.ca mcmaster.ca dal.ca sfu.ca yorku.ca carleton.ca
concordia.ca ulaval.ca umontreal.ca usherbrooke.ca polymtl.ca etsmtl.ca
`.trim().split(/\s+/);
for (const d of UNIS) add(d);

const GOV = `
whitehouse.gov congress.gov senate.gov house.gov supremecourt.gov usa.gov
irs.gov ssa.gov fda.gov cdc.gov nih.gov nasa.gov noaa.gov usgs.gov epa.gov
energy.gov defense.gov state.gov treasury.gov justice.gov dhs.gov va.gov
hud.gov dot.gov ed.gov usda.gov commerce.gov labor.gov hhs.gov
interior.gov cia.gov fbi.gov nsa.gov dia.mil darpa.mil army.mil navy.mil
af.mil marines.mil spaceforce.mil gov.uk parliament.uk nhs.uk
hmrc.gov.uk dvla.gov.uk gov.scot gov.wales nidirect.gov.uk europa.eu
ec.europa.eu europarl.europa.eu consilium.europa.eu ecb.europa.eu
curia.europa.eu eeas.europa.eu un.org who.int unicef.org unesco.org
ilo.org imf.org worldbank.org wto.org oecd.org nato.int iaea.org
icao.int imo.org wipo.int itu.int wmo.int unhcr.org wfp.org undp.org
unep.org ohchr.org icrc.org redcross.org doctorswithoutborders.org
amnesty.org hrw.org transparency.org greenpeace.org wwf.org nature.org
sierraclub.org nrdc.org edf.org ucsusa.org climate.gov ipcc.ch unfccc.int
`.trim().split(/\s+/);
for (const d of GOV) add(d);

const SPORTS = `
espn.com nba.com nfl.com mlb.com nhl.com mls.com fifa.com uefa.com
olympics.com formula1.com motogp.com wimbledon.com rolandgarros.com
usopen.org ausopen.com pga.com lpga.com atptour.com wtatennis.com ufc.com
wwe.com bleacherreport.com sbnation.com theathletic.com goal.com
transfermarkt.com sofascore.com flashscore.com livescore.com
oddschecker.com draftkings.com fanduel.com bet365.com williamhill.com
paddypower.com unibet.com betfair.com sportsbet.com.au tab.com.au
neds.com.au pointsbet.com skysports.com cbssports.com nbcsports.com
foxsports.com dazn.com
`.trim().split(/\s+/);
for (const d of SPORTS) add(d);

const MORE = `
techcrunch.com wired.com theverge.com arstechnica.com engadget.com
spiegel.de bild.de focus.de stern.de zeit.de faz.net sueddeutsche.de
welt.de tagesschau.de n-tv.de rtl.de prosieben.de sat1.de vox.de
kicker.de transfermarkt.de sport1.de sky.de web.de gmx.de t-online.de
immobilienscout24.de immowelt.de wg-gesucht.de kleinanzeigen.de
mobile.de autoscout24.de check24.de verivox.de idealo.de geizhals.at
billiger.de otto.de zalando.de aboutyou.de lidl.de aldi.de rewe.de
edeka.de penny.de mediamarkt.de saturn.de notebooksbilliger.de
alternate.de cyberport.de mindfactory.de caseking.de amazon.de ebay.de
stepstone.de xing.com meinestadt.de bilibili.com zhihu.com douban.com
iqiyi.com youku.com ctrip.com qunar.com fliggy.com lazada.com shopee.com
tokopedia.com bukalapak.com grab.com gojek.com mercadolibre.com
mercadopago.com uol.com.br globo.com olx.com.br americanas.com.br
magazineluiza.com casasbahia.com submarino.com buscape.com.br
rakuten.co.jp yahoo.co.jp amazon.co.jp google.co.jp nicovideo.jp
fc2.com ameblo.jp goo.ne.jp livedoor.com hatena.ne.jp pixiv.net
dmm.com kakaku.com hotpepper.jp tabelog.com cookpad.com mercari.com
paypay.ne.jp line.me softbank.jp docomo.ne.jp au.com rikunabi.com
mynavi.jp doda.jp en-japan.com fortnite.com leagueoflegends.com
valorant.com playvalorant.com riotgames.com battle.net
worldofwarcraft.com diablo.com overwatch.com hearthstone.com
starcraft.com callofduty.com origin.com easports.com uplay.com
rockstargames.com take2games.com gog.com itch.io humblebundle.com
greenmangaming.com fanatical.com cdkeys.com eneba.com g2a.com
kinguin.net isthereanydeal.com dekudeals.com psprices.com gg.deals
howlongtobeat.com opencritic.com metacritic.com letterboxd.com trakt.tv
tvmaze.com themoviedb.org thetvdb.com justwatch.com reelgood.com
peacocktv.com paramountplus.com appletv.com funimation.com
myanimelist.net anilist.co kitsu.io anidb.net mangaupdates.com
mangadex.org webtoons.com tapas.io lezhin.com tappytoon.com
comixology.com marvel.com dccomics.com imagecomics.com darkhorse.com
viz.com shonenjump.com mangaplus.shueisha.co.jp meta.com oculus.com
join.me webex.com gotomeeting.com bluejeans.com whereby.com
gather.town spatial.io
`.trim().split(/\s+/);
for (const d of MORE) add(d);

if (existsSync(EXISTING)) {
  try {
    const json = JSON.parse(readFileSync(EXISTING, "utf8"));
    for (const row of json.sites ?? []) add(row.domain);
  } catch {
    /* ignore */
  }
}

mkdirSync(dirname(OUT), { recursive: true });
const list = [...set].sort();
writeFileSync(OUT, `${list.join("\n")}\n`);
console.log(`Wrote ${list.length} domains to ${OUT}`);
