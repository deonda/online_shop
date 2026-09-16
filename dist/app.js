const mealSets = {
  breakfast: [
    ['Овсянка с ягодами','🫐','#f9ead9'], ['Тост с авокадо','🥑','#e7f0d7'], ['Сырники со сметаной','🥞','#fff0dc'], ['Омлет с овощами','🍳','#fff3ce'], ['Гречневая каша','🥣','#f2e4cb']
  ],
  lunch: [
    ['Овощное рагу с нутом','🥘','#fde9df'], ['Суп-пюре из брокколи','🍵','#ddf0de'], ['Гречка с овощами','🍛','#f9e4d2'], ['Булгур с фасолью','🍲','#fee9ca'], ['Паста с томатами','🍝','#fee1d5']
  ],
  dinner: [
    ['Рис с овощами и тофу','🍚','#eaf2df'], ['Овощное карри','🍛','#ffe4bf'], ['Запечённые овощи','🥦','#dfeee0'], ['Картофельная запеканка','🥔','#f8e5c2'], ['Салат с киноа','🥗','#e4f1df']
  ],
  snack: [
    ['Яблоко и йогурт','🍎','#fbe4de'], ['Банан','🍌','#fff3ba'], ['Морковь и хумус','🥕','#ffe4c2'], ['Груша','🍐','#e9f0cc'], ['Фруктовый салат','🍊','#fbe8c8']
  ]
};
const week = [['Пн','14 апр'],['Вт','15 апр'],['Ср','16 апр'],['Чт','17 апр'],['Пт','18 апр'],['Сб','19 апр'],['Вс','20 апр']];
const basketCategories = [
  ['🥬','Овощи и зелень',1890],['🍎','Фрукты и ягоды',980],['🧀','Крупы и макароны',620],['🫘','Бобовые',450],['🥛','Молочные продукты',890],['🌱','Растительные альтернативы',520],['🛍️','Прочие продукты',1030]
];
let seed = 0;
const money = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
function renderMenu(){
  const days = document.getElementById('days'); days.innerHTML = '';
  const mealsPerDay = Number(document.getElementById('mealCount').value);
  const mealTypes = mealsPerDay === 2 ? ['breakfast', 'dinner'] : mealsPerDay === 3 ? ['breakfast', 'lunch', 'dinner'] : Object.keys(mealSets);
  week.forEach((info, index) => {
    const day = document.createElement('article'); day.className = 'day' + (index > 4 ? ' weekend' : '');
    day.innerHTML = `<div class="day-title">${info[0]}</div><span class="day-date">${info[1]}</span>`;
    mealTypes.forEach(type => {
      const choices = mealSets[type];
      const meal = choices[(index + seed + Object.keys(mealSets).indexOf(type)) % choices.length];
      const button = document.createElement('button'); button.className = 'meal'; button.type = 'button'; button.title = 'Заменить: ' + meal[0];
      button.innerHTML = `<span class="meal-photo" style="--meal-color:${meal[2]}">${meal[1]}</span><span class="meal-name">${meal[0]}</span>`;
      button.addEventListener('click', () => { seed++; renderMenu(); showToast('Блюдо заменено на похожий вариант'); }); day.append(button);
    }); days.append(day);
  });
}
function selectedCount(){return document.querySelectorAll('.chip.selected').length}
function updateBasket(){
  const budget = Number(document.getElementById('budget').value) || 0;
  const tolerance = Number(document.getElementById('tolerance').value);
  const mealsPerDay = Number(document.getElementById('mealCount').value);
  const city = document.getElementById('city').value || 'вашего города';
  const filterMultiplier = 1 + Math.max(0, selectedCount() - 1) * .024;
  const storeMultiplier = { 'Пятёрочка':1, 'Магнит':.98, 'Перекрёсток':1.12, 'Чижик':.91, 'Светофор':.86 }[document.getElementById('store').value] || 1;
  const mealMultiplier = { 2: .64, 3: .82, 4: 1 }[mealsPerDay];
  const total = Math.round(6380 * filterMultiplier * storeMultiplier * mealMultiplier / 10) * 10;
  const allowed = Math.round(budget * (1 + tolerance / 100));
  const diff = allowed - total;
  const list = document.getElementById('basketList'); list.innerHTML = '';
  basketCategories.forEach(([emoji,name,amount]) => { const row = document.createElement('div'); row.className = 'basket-row'; row.innerHTML = `<span class="emoji">${emoji}</span><span>${name}</span><strong>${money(amount * total / 6380)}</strong>`; list.append(row); });
  document.getElementById('totalPrice').textContent = money(total);
  document.getElementById('itemCounter').textContent = `${Math.round((24 + selectedCount()) * mealMultiplier)} товаров`;
  const message = document.getElementById('budgetMessage');
  message.classList.toggle('over', diff < 0);
  document.getElementById('heroRemaining').textContent = money(Math.abs(diff));
  const within = diff >= 0;
  message.innerHTML = `<span aria-hidden="true">${within ? '♧' : '!'}</span><p><b>${within ? 'Вы уложились в бюджет!' : 'Нужно немного больше бюджета'}</b><br /><small>${within ? 'Осталось ' + money(diff) : 'Не хватает ' + money(-diff)}</small></p>`;
  document.getElementById('heroRemaining').previousElementSibling.textContent = within ? 'Ваш запас' : 'Нужно добавить';
  document.getElementById('heroRemaining').nextElementSibling.textContent = `для ${city}`;
}
function updateTolerance(){ const value = Number(document.getElementById('tolerance').value); document.getElementById('toleranceText').textContent = value === 0 ? 'Строго в рамках бюджета' : `Можно превысить бюджет на ${value}%`; updateBasket(); }
let toastTimer; function showToast(message){ const toast=document.getElementById('toast'); toast.textContent=message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2600); }
document.querySelectorAll('.chip:not(.add-chip)').forEach(button=>button.addEventListener('click',()=>{button.classList.toggle('selected');updateBasket()}));
document.querySelector('.add-chip').addEventListener('click',()=>showToast('Дополнительные ограничения появятся в следующей версии'));
document.getElementById('tolerance').addEventListener('input',updateTolerance);
document.getElementById('budget').addEventListener('input',updateBasket);
document.getElementById('store').addEventListener('change',event=>{document.getElementById('storeGlyph').textContent=event.target.value[0];updateBasket();showToast('Корзина пересчитана для сети «' + event.target.value + '»')});
document.getElementById('mealCount').addEventListener('change', event=>{renderMenu();updateBasket();showToast(`Меню обновлено: ${event.target.value} приёма пищи в день`)});
document.getElementById('city').addEventListener('change',()=>{updateBasket();showToast('Город сохранён. Проверим доступность сети позже.')});
document.querySelector('.clear-city').addEventListener('click',()=>{const city=document.getElementById('city');city.value='';city.focus()});
document.getElementById('editBudget').addEventListener('click',()=>document.getElementById('budget').focus());
document.getElementById('regenerate').addEventListener('click',()=>{seed += 2;renderMenu();updateBasket();showToast('Собрали новые варианты блюд')});
document.getElementById('shoppingList').addEventListener('click',()=>showToast('Список покупок сохранён на этом устройстве'));
renderMenu(); updateTolerance(); if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
