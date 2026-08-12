import type { Flashcard } from './types.js';

export async function initFlashcards() {
  const response=await fetch('assets/data/flashcards.json');
  const cards=(await response.json()) as Flashcard[];
  let index=0;
  const card=document.querySelector<HTMLElement>('#deckCard');
  const type=document.querySelector<HTMLElement>('#deckType');
  const count=document.querySelector<HTMLElement>('#deckCount');
  const question=document.querySelector<HTMLElement>('#deckQuestion');
  const verdict=document.querySelector<HTMLElement>('#deckVerdict');
  const answer=document.querySelector<HTMLElement>('#deckAnswer');
  const dots=document.querySelector<HTMLElement>('#deckDots');

  function render(){
    const item=cards[index];card?.classList.remove('flipped');
    if(type)type.textContent=item.type;if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    if(question)question.textContent=item.question;if(verdict)verdict.textContent=item.verdict;if(answer)answer.textContent=item.answer;
    if(dots)dots.innerHTML=cards.map((_,i)=>`<i class="${i===index?'active':''}"></i>`).join('');
  }
  document.querySelector('#revealCard')?.addEventListener('click',()=>card?.classList.add('flipped'));
  document.querySelector('#hideCard')?.addEventListener('click',()=>card?.classList.remove('flipped'));
  document.querySelector('#nextCard')?.addEventListener('click',()=>{index=(index+1)%cards.length;render()});
  document.querySelector('#prevCard')?.addEventListener('click',()=>{index=(index-1+cards.length)%cards.length;render()});
  render();
}
