(() => {
  const shelf = document.querySelector('#paper-achievements.paper-folios');
  if (!shelf) return;

  const cards = [...shelf.querySelectorAll('.paper-folio')];
  const setFace = (card, flipped) => {
    const front = card.querySelector('.folio-front');
    const back = card.querySelector('.folio-back');
    const button = card.querySelector('.folio-flip');
    card.classList.toggle('is-flipped', flipped);
    front.inert = flipped;
    back.inert = !flipped;
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    button.setAttribute('aria-pressed', String(flipped));
    button.setAttribute('aria-label', flipped ? button.dataset.coverLabel : button.dataset.notesLabel);
    button.querySelector('span').textContent = flipped ? '返回封面' : '展开要点';
  };

  cards.forEach(card => {
    const button = card.querySelector('.folio-flip');
    button.dataset.notesLabel = `展开${card.querySelector('h3').textContent}的研究要点`;
    button.dataset.coverLabel = `查看${card.querySelector('h3').textContent}的封面`;
    setFace(card, false);
    card.querySelector('.folio-flip').addEventListener('click', () => {
      setFace(card, !card.classList.contains('is-flipped'));
    });
    card.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !card.classList.contains('is-flipped')) return;
      event.preventDefault();
      card.querySelector('.folio-flip').focus();
      setFace(card, false);
    });
  });
  shelf.classList.add('is-interactive');
})();
