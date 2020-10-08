var app=function(){"use strict";function e(){}function l(e){return e()}function t(){return Object.create(null)}function n(e){e.forEach(l)}function i(e){return"function"==typeof e}function a(e,l){return e!=e?l==l:e!==l||e&&"object"==typeof e||"function"==typeof e}function o(e,l){e.appendChild(l)}function r(e,l,t){e.insertBefore(l,t||null)}function s(e){e.parentNode.removeChild(e)}function c(e,l){for(let t=0;t<e.length;t+=1)e[t]&&e[t].d(l)}function u(e){return document.createElement(e)}function m(e){return document.createTextNode(e)}function p(){return m(" ")}function v(){return m("")}function h(e,l,t,n){return e.addEventListener(l,t,n),()=>e.removeEventListener(l,t,n)}function d(e,l,t){null==t?e.removeAttribute(l):e.getAttribute(l)!==t&&e.setAttribute(l,t)}function f(e,l){l=""+l,e.wholeText!==l&&(e.data=l)}function g(e,l){for(let t=0;t<e.options.length;t+=1){const n=e.options[t];if(n.__value===l)return void(n.selected=!0)}}function x(e){const l=e.querySelector(":checked")||e.options[0];return l&&l.__value}let M;function S(e){M=e}const L=[],D=[],_=[],b=[],y=Promise.resolve();let C=!1;function $(e){_.push(e)}let N=!1;const I=new Set;function k(){if(!N){N=!0;do{for(let e=0;e<L.length;e+=1){const l=L[e];S(l),P(l.$$)}for(S(null),L.length=0;D.length;)D.pop()();for(let e=0;e<_.length;e+=1){const l=_[e];I.has(l)||(I.add(l),l())}_.length=0}while(L.length);for(;b.length;)b.pop()();C=!1,N=!1,I.clear()}}function P(e){if(null!==e.fragment){e.update(),n(e.before_update);const l=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,l),e.after_update.forEach($)}}const E=new Set;function W(e,l){-1===e.$$.dirty[0]&&(L.push(e),C||(C=!0,y.then(k)),e.$$.dirty.fill(0)),e.$$.dirty[l/31|0]|=1<<l%31}function R(a,o,r,c,u,m,p=[-1]){const v=M;S(a);const h=o.props||{},d=a.$$={fragment:null,ctx:null,props:m,update:e,not_equal:u,bound:t(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(v?v.$$.context:[]),callbacks:t(),dirty:p,skip_bound:!1};let f=!1;if(d.ctx=r?r(a,h,((e,l,...t)=>{const n=t.length?t[0]:l;return d.ctx&&u(d.ctx[e],d.ctx[e]=n)&&(!d.skip_bound&&d.bound[e]&&d.bound[e](n),f&&W(a,e)),l})):[],d.update(),f=!0,n(d.before_update),d.fragment=!!c&&c(d.ctx),o.target){if(o.hydrate){const e=function(e){return Array.from(e.childNodes)}(o.target);d.fragment&&d.fragment.l(e),e.forEach(s)}else d.fragment&&d.fragment.c();o.intro&&((g=a.$$.fragment)&&g.i&&(E.delete(g),g.i(x))),function(e,t,a){const{fragment:o,on_mount:r,on_destroy:s,after_update:c}=e.$$;o&&o.m(t,a),$((()=>{const t=r.map(l).filter(i);s?s.push(...t):n(t),e.$$.on_mount=[]})),c.forEach($)}(a,o.target,o.anchor),k()}var g,x;S(v)}function w(e,l,t){const n=e.slice();return n[9]=l[t],n}function O(e,l,t){const n=e.slice();return n[12]=l[t],n}function B(e,l,t){const n=e.slice();return n[12]=l[t],n}function T(e){let l,t,n,i=e[12].level+"";return{c(){l=u("option"),t=m(i),l.__value=n=e[12],l.value=l.__value},m(e,n){r(e,l,n),o(l,t)},p(e,a){2&a&&i!==(i=e[12].level+"")&&f(t,i),2&a&&n!==(n=e[12])&&(l.__value=n,l.value=l.__value)},d(e){e&&s(l)}}}function j(e){let l,t,n,i,a,c=e[12].levelMin+"",p=e[12].levelMax+"";return{c(){l=u("option"),t=m(c),n=m("-"),i=m(p),l.__value=a=e[12],l.value=l.__value},m(e,a){r(e,l,a),o(l,t),o(l,n),o(l,i)},p(e,n){2&n&&c!==(c=e[12].levelMin+"")&&f(t,c),2&n&&p!==(p=e[12].levelMax+"")&&f(i,p),2&n&&a!==(a=e[12])&&(l.__value=a,l.value=l.__value)},d(e){e&&s(l)}}}function A(e){let l,t,n,i=e[12].levelMax+"";return{c(){l=u("option"),t=m(i),l.__value=n=e[12],l.value=l.__value},m(e,n){r(e,l,n),o(l,t)},p(e,a){2&a&&i!==(i=e[12].levelMax+"")&&f(t,i),2&a&&n!==(n=e[12])&&(l.__value=n,l.value=l.__value)},d(e){e&&s(l)}}}function F(e){let l;function t(e,l){return e[12].levelMin===e[12].levelMax?A:j}let n=t(e),i=n(e);return{c(){i.c(),l=v()},m(e,t){i.m(e,t),r(e,l,t)},p(e,a){n===(n=t(e))&&i?i.p(e,a):(i.d(1),i=n(e),i&&(i.c(),i.m(l.parentNode,l)))},d(e){i.d(e),e&&s(l)}}}function U(e){let l,t,n,i,a,c=e[9].level+"",p=e[9].spells.join(", ")+"";return{c(){l=u("div"),t=m("Level "),n=m(c),i=m(": "),a=m(p)},m(e,s){r(e,l,s),o(l,t),o(l,n),o(l,i),o(l,a)},p(e,l){16&l&&c!==(c=e[9].level+"")&&f(n,c),16&l&&p!==(p=e[9].spells.join(", ")+"")&&f(a,p)},d(e){e&&s(l)}}}function G(e){let l,t=e[9].spells.length>0&&U(e);return{c(){t&&t.c(),l=v()},m(e,n){t&&t.m(e,n),r(e,l,n)},p(e,n){e[9].spells.length>0?t?t.p(e,n):(t=U(e),t.c(),t.m(l.parentNode,l)):t&&(t.d(1),t=null)},d(e){t&&t.d(e),e&&s(l)}}}function H(l){let t,i,a,v,x,M,S,L,D,_,b,y,C,N,I,k,P,E,W,R,j,A,U,H,V,q,z,J,K,Q,X,Y,Z,ee,le,te,ne,ie,ae,oe,re,se,ce,ue,me,pe,ve,he,de,fe,ge,xe,Me,Se,Le,De,_e,be,ye=l[0].title+"",Ce=l[2].level+"",$e=l[2].experience+"",Ne=l[3].spellChance+"",Ie=l[3].minNum+"",ke=l[3].maxNum+"",Pe=l[3].maxLevel+"",Ee=l[2].level+"",We=l[0].version+"",Re=l[1].classes.magicUser.levels,we=[];for(let e=0;e<Re.length;e+=1)we[e]=T(B(l,Re,e));let Oe=l[1].abilities.intelligence,Be=[];for(let e=0;e<Oe.length;e+=1)Be[e]=F(O(l,Oe,e));let Te=l[4],je=[];for(let e=0;e<Te.length;e+=1)je[e]=G(w(l,Te,e));return{c(){t=u("div"),i=u("div"),a=u("header"),v=u("h1"),x=m(ye),M=p(),S=u("p"),S.textContent="Misc tools for playing OD&D by way of Iron Falcon.",L=p(),D=u("main"),_=u("h2"),_.textContent="Extended Spell List",b=p(),y=u("fieldset"),C=u("legend"),C.textContent="Configure",N=p(),I=u("div"),k=m("Character Level:\n\t\t\t\t\t"),P=u("select");for(let e=0;e<we.length;e+=1)we[e].c();E=p(),W=u("div"),R=m("Intelligence:\n\t\t\t\t\t"),j=u("select");for(let e=0;e<Be.length;e+=1)Be[e].c();A=p(),U=u("div"),H=u("small"),V=m("Level="),q=m(Ce),z=m(", \n\t\t\t\t\t\tExperience="),J=m($e),K=m(", \n\t\t\t\t\t\tChance="),Q=m(Ne),X=m("%, \n\t\t\t\t\t\tMin="),Y=m(Ie),Z=m(", \n\t\t\t\t\t\tMax="),ee=m(ke),le=m(", \n\t\t\t\t\t\tMaxLevel="),te=m(Pe),ne=m("."),ie=p(),ae=u("button"),ae.textContent="Generate Spellbook",oe=p(),re=u("fieldset"),se=u("legend"),ce=m("Level "),ue=m(Ee),me=m(" Magic-User's Spellbook"),pe=p();for(let e=0;e<je.length;e+=1)je[e].c();ve=p(),he=u("footer"),de=u("small"),fe=m("Text used is © 2014-2016 Chris Gonnerman. For code, see the "),ge=u("a"),xe=m("github repo"),Se=m(". Last deployed "),Le=m(We),De=m("."),d(v,"class","svelte-1d16ed0"),void 0===l[2]&&$((()=>l[7].call(P))),void 0===l[3]&&$((()=>l[8].call(j))),d(re,"id","spellBook"),d(D,"class","svelte-1d16ed0"),d(ge,"href",Me=l[0].ghRepo),d(he,"class","svelte-1d16ed0"),d(i,"class","item svelte-1d16ed0"),d(t,"class","container svelte-1d16ed0")},m(e,n){r(e,t,n),o(t,i),o(i,a),o(a,v),o(v,x),o(a,M),o(a,S),o(i,L),o(i,D),o(D,_),o(D,b),o(D,y),o(y,C),o(y,N),o(y,I),o(I,k),o(I,P);for(let e=0;e<we.length;e+=1)we[e].m(P,null);g(P,l[2]),o(y,E),o(y,W),o(W,R),o(W,j);for(let e=0;e<Be.length;e+=1)Be[e].m(j,null);g(j,l[3]),o(W,A),o(W,U),o(U,H),o(H,V),o(H,q),o(H,z),o(H,J),o(H,K),o(H,Q),o(H,X),o(H,Y),o(H,Z),o(H,ee),o(H,le),o(H,te),o(H,ne),o(D,ie),o(D,ae),o(D,oe),o(D,re),o(re,se),o(se,ce),o(se,ue),o(se,me),o(re,pe);for(let e=0;e<je.length;e+=1)je[e].m(re,null);o(i,ve),o(i,he),o(he,de),o(de,fe),o(de,ge),o(ge,xe),o(de,Se),o(de,Le),o(de,De),_e||(be=[h(P,"change",l[7]),h(P,"change",l[5]),h(j,"change",l[8]),h(ae,"click",l[6])],_e=!0)},p(e,[l]){if(1&l&&ye!==(ye=e[0].title+"")&&f(x,ye),2&l){let t;for(Re=e[1].classes.magicUser.levels,t=0;t<Re.length;t+=1){const n=B(e,Re,t);we[t]?we[t].p(n,l):(we[t]=T(n),we[t].c(),we[t].m(P,null))}for(;t<we.length;t+=1)we[t].d(1);we.length=Re.length}if(6&l&&g(P,e[2]),2&l){let t;for(Oe=e[1].abilities.intelligence,t=0;t<Oe.length;t+=1){const n=O(e,Oe,t);Be[t]?Be[t].p(n,l):(Be[t]=F(n),Be[t].c(),Be[t].m(j,null))}for(;t<Be.length;t+=1)Be[t].d(1);Be.length=Oe.length}if(10&l&&g(j,e[3]),4&l&&Ce!==(Ce=e[2].level+"")&&f(q,Ce),4&l&&$e!==($e=e[2].experience+"")&&f(J,$e),8&l&&Ne!==(Ne=e[3].spellChance+"")&&f(Q,Ne),8&l&&Ie!==(Ie=e[3].minNum+"")&&f(Y,Ie),8&l&&ke!==(ke=e[3].maxNum+"")&&f(ee,ke),8&l&&Pe!==(Pe=e[3].maxLevel+"")&&f(te,Pe),4&l&&Ee!==(Ee=e[2].level+"")&&f(ue,Ee),16&l){let t;for(Te=e[4],t=0;t<Te.length;t+=1){const n=w(e,Te,t);je[t]?je[t].p(n,l):(je[t]=G(n),je[t].c(),je[t].m(re,null))}for(;t<je.length;t+=1)je[t].d(1);je.length=Te.length}1&l&&Me!==(Me=e[0].ghRepo)&&d(ge,"href",Me),1&l&&We!==(We=e[0].version+"")&&f(Le,We)},i:e,o:e,d(e){e&&s(t),c(we,e),c(Be,e),c(je,e),_e=!1,n(be)}}}function V(e,l){let t=!0;for(;t;){let n=q(l);if(!e.includes(n))return t=!1,n}}function q(e){return e[Math.floor(Math.random()*e.length)]}function z(){return e=1,l=100,Math.floor(Math.random()*(l-e+1))+e;var e,l}function J(e){return JSON.parse(JSON.stringify(e))}function K(e,l,t){let{appData:n}=l,{ifData:i}=l,a=i.classes.magicUser.levels[0],o=i.abilities.intelligence[4],r=J(i.classes.magicUser.startingSpellBook);function s(){t(4,r=J(i.classes.magicUser.startingSpellBook))}return e.$$set=e=>{"appData"in e&&t(0,n=e.appData),"ifData"in e&&t(1,i=e.ifData)},[n,i,a,o,r,s,function(){s();for(let e=0;e<a.maxSpellLevel;e++){let l=r[e].spells,t=J(i.classes.magicUser.spells[e]);0==e&&(t=t.filter((e=>"Read Magic"!==e)));let n=!0;for(;n;){if(0===t.length){n=!1;continue}if(l.length>=o.maxNum){n=!1;continue}if(l.length<o.minNum){let e=V(l,t);l.push(e),t=t.filter((l=>l!==e)),n=!0;continue}let e=V(l,t);z()<=o.spellChance&&l.push(e),t=t.filter((l=>l!==e)),n=!0}}},function(){a=x(this),t(2,a),t(1,i)},function(){o=x(this),t(3,o),t(1,i)}]}var Q={title:"OD&D Tools",version:"08 Oct 2020 14:58:00",ghRepo:"https://github.com/ScottMaclure/oddtools"},X={abilities:{intelligence:[{levelMin:3,levelMax:4,spellChance:20,minNum:2,maxNum:3,maxLevel:5},{levelMin:5,levelMax:7,spellChance:30,minNum:2,maxNum:4,maxLevel:5},{levelMin:8,levelMax:9,spellChance:40,minNum:3,maxNum:5,maxLevel:5},{levelMin:10,levelMax:11,spellChance:50,minNum:4,maxNum:6,maxLevel:5},{levelMin:12,levelMax:12,spellChance:50,minNum:4,maxNum:6,maxLevel:6},{levelMin:13,levelMax:13,spellChance:65,minNum:5,maxNum:8,maxLevel:6},{levelMin:14,levelMax:14,spellChance:65,minNum:5,maxNum:8,maxLevel:7},{levelMin:15,levelMax:15,spellChance:75,minNum:6,maxNum:10,maxLevel:7},{levelMin:16,levelMax:16,spellChance:75,minNum:6,maxNum:10,maxLevel:8},{levelMin:17,levelMax:17,spellChance:85,minNum:7,maxNum:99,maxLevel:8},{levelMin:18,levelMax:18,spellChance:95,minNum:8,maxNum:99,maxLevel:9}]},classes:{magicUser:{startingSpellBook:[{level:1,spells:["Read Magic"]},{level:2,spells:[]},{level:3,spells:[]},{level:4,spells:[]},{level:5,spells:[]},{level:6,spells:[]},{level:7,spells:[]},{level:8,spells:[]},{level:9,spells:[]}],_spells_comment:"TODO turn these into objects later.",spells:[["Charm Person","Detect Magic","Hold Portal","Light","Magic Missile","Protection from Evil","Read Languages","Read Magic","Shield","Sleep","Ventriloquism"],["Continual Light","Darkness, 5' Radius","Detect Evil","Detect Invisible","ESP","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Mirror Image","Phantasmal Forces","Pyrotechnics","Strength","Web","Wizard Lock"],["Clairaudience","Clairvoyance","Dispel Magic","Explosive Runes","Fire Ball","Fly","Haste Spell","Hold Person","Infravision","Invisibility, 10' Radius","Lightning Bolt","Monster Summoning I","Protection from Evil, 10' Radius","Protection from Normal Missiles","Rope Trick","Slow Spell","Suggestion","Water Breathing"],["Charm Monster","Confusion","Dimension Door","Extension I","Fear","Growth of Plants","Hallucinatory Terrain","Ice Storm","Massmorph","Monster Summoning II","Polymorph Others","Polymorph Self","Remove Curse","Wall Of Fire","Wall Of Ice","Wizard Eye"],["Animate Dead","Cloudkill","Conjure Elemental","Contact Higher Plane","Extension II","Feeblemind","Growth of Animals","Hold Monster","Magic Jar","Monster Summoning III","Pass-Wall","Telekinesis","Teleport","Transmute Rock to Mud/Transmute Mud to Rock","Wall of Iron","Wall of Stone"],["Anti-Magic Shell","Control Weather","Death Spell","Disintegrate","Extension III","Geas","Invisible Stalker","Legend Lore","Lower Water","Monster Summoning IV","Move Earth","Part Water"],["Charm Plants","Delayed Blast Fire Ball","Limited Wish","Mass Invisibility","Monster Summoning V","Phase Door","Power Word-Stun","Reverse Gravity","Simulacrum"],["Mass Charm","Clone","Power Word-Blind","Symbol","Permanent Spell","Mind Blank","Polymorph Any Object","Monster Summoning VI"],["Meteor Swarm","Shape Change","Time Stop","Power Word-Kill","Gate","Wish","Astral Spell","Prismatic Wall","Maze","Monster Summoning VII"]],levels:[{level:1,hitDice:"1d4",experience:0,maxSpellLevel:1},{level:2,hitDice:"2d4",experience:2400,maxSpellLevel:1},{level:3,hitDice:"3d4",experience:4800,maxSpellLevel:2},{level:4,hitDice:"4d4",experience:9600,maxSpellLevel:2},{level:5,hitDice:"5d4",experience:19200,maxSpellLevel:3},{level:6,hitDice:"6d4",experience:38500,maxSpellLevel:3},{level:7,hitDice:"7d4",experience:84e3,maxSpellLevel:4},{level:8,hitDice:"8d4",experience:18e4,maxSpellLevel:4},{level:9,hitDice:"9d4",experience:3e5,maxSpellLevel:5},{level:10,hitDice:"9d4",experience:6e5,maxSpellLevel:5},{level:11,hitDice:"9d4+1",experience:82e4,maxSpellLevel:5},{level:12,hitDice:"9d4+1",experience:104e4,maxSpellLevel:6},{level:13,hitDice:"9d4+2",experience:126e4,maxSpellLevel:6},{level:14,hitDice:"9d4+2",experience:148e4,maxSpellLevel:7},{level:15,hitDice:"9d4+3",experience:17e5,maxSpellLevel:7},{level:16,hitDice:"9d4+3",experience:192e4,maxSpellLevel:8},{level:17,hitDice:"9d4+4",experience:214e4,maxSpellLevel:8},{level:18,hitDice:"9d4+4",experience:236e4,maxSpellLevel:9},{level:19,hitDice:"9d4+5",experience:258e4,maxSpellLevel:9},{level:20,hitDice:"9d4+5",experience:28e5,maxSpellLevel:9},{level:21,hitDice:"9d4+6",experience:302e4,maxSpellLevel:9},{level:22,hitDice:"9d4+6",experience:324e4,maxSpellLevel:9}]}}};return new class extends class{$destroy(){!function(e,l){const t=e.$$;null!==t.fragment&&(n(t.on_destroy),t.fragment&&t.fragment.d(l),t.on_destroy=t.fragment=null,t.ctx=[])}(this,1),this.$destroy=e}$on(e,l){const t=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return t.push(l),()=>{const e=t.indexOf(l);-1!==e&&t.splice(e,1)}}$set(e){var l;this.$$set&&(l=e,0!==Object.keys(l).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),R(this,e,K,H,a,{appData:0,ifData:1})}}({target:document.body,props:{appData:Q,ifData:X}})}();
//# sourceMappingURL=bundle.js.map
