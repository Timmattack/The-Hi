const WIDTH_SCALE = 1.5;
const THE_HI = 'https://raw.githubusercontent.com/Timmattack/The-Hi/refs/heads/image/image/scientist-reveal-hi.png'
const HI = 'hi'

const superpositions = []; // { range, img, metriques }

function superposerOccurrences(racine, motif, src) {
	const regex = new RegExp(motif, 'gui');
	
	const walker = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
	const noeuds = [];
	while (walker.nextNode()) noeuds.push(walker.currentNode);
	
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const BALISES_A_IGNORER = ['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT'];
	
	for (const noeud of noeuds) {
		const parent = noeud.parentElement;
		if (!parent || BALISES_A_IGNORER.includes(parent.tagName)) continue;
		
		const correspondances = [...noeud.textContent.matchAll(regex)];
		if (correspondances.length === 0) continue;
		console.log(noeud)
		const cs = getComputedStyle(parent);
		ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

		for (const m of correspondances) {
			const range = document.createRange();
			range.setStart(noeud, m.index);
			range.setEnd(noeud, m.index + m[0].length);
			
			const metriques = ctx.measureText(m[0]);

			const img = new Image();
			img.src = typeof src === 'function' ? src(m[0]) : src;
			img.alt = '';
			img.style.position = 'absolute';
			img.style.pointerEvents = 'none';
			img.style.zIndex = '10';
			document.body.appendChild(img);
			
			superpositions.push({ range, img, metriques });
		}
	}
	repositionner();
}

function repositionner() {
	const scrollX = window.scrollX;
	const scrollY = window.scrollY;
	
	for (const s of superpositions) {
		const rect = s.range.getBoundingClientRect();
		
		if (rect.width === 0) {           // élément caché / hors écran
			s.img.style.display = 'none';
			continue;
		}
		
		// Ligne de base du texte = bas du rect - descente de police
		const baseligne = rect.bottom - s.metriques.fontBoundingBoxDescent;
		
		s.img.style.left = rect.left + scrollX + 'px';
		s.img.style.top = baseligne - s.metriques.actualBoundingBoxAscent + scrollY + 'px';
		s.img.style.width = s.metriques.width + 'px';
		s.img.style.height =
		s.metriques.actualBoundingBoxAscent + s.metriques.actualBoundingBoxDescent + 'px';
		s.img.style.display = '';
	}
}

superposerOccurrences(document.body, HI, THE_HI);

// Repositionner quand la mise en page bouge
window.addEventListener('resize', repositionner);
window.addEventListener('load', repositionner);
document.fonts?.ready.then(repositionner);
