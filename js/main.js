const elemLoad = document.querySelector('#Load');
const elemMain = document.querySelector('#Main');
const elemSelectCntr = elemMain.querySelector('#SelectCntr');
const elemSelectCity = elemSelectCntr.querySelector('#SelectCity');
const elemSelectTown = elemSelectCntr.querySelector('#SelectTown');
const elemDisplay = elemMain.querySelector('#Display');
const foodsURL = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx';
let isInitialization = false;
let isTownClicked = false;
let dinnerInfoByCityArr;
let dinnerInfoArr;
let cityIndexInt = 0;

async function setInit() {
  dinnerInfoArr = await getDataByApi(foodsURL);
  handleData();
  render();
  removeLoad();
  setEvent();
  isInitialization = true;
}

async function getDataByApi(URL) {
  try {
    return fetch(URL).then(res => res.json());
  } catch (error) {
    alert('錯誤訊息： ', error);
  }
}

/**
 * @description 在渲染畫面前先整理資料
 */
function handleData() {
  dinnerInfoByCityArr = makeArrByCityArr(dinnerInfoArr);
}

/**
 * @description 將拿到的原始arr以city的種類來進行分類並且回傳先的arr
 * @param {Array} originalArr
 * @param {String} currentCity
 * @param {Array} arr
 */
function makeArrByCityArr(originalArr, currentCity='', arr=[{
  city: '請選擇行政區域',
  townArr: ["請選擇鄉政區"],
}]) {
  originalArr.forEach(item => {
    if (currentCity !== item.City) {
      arr.push({
        city: item.City,
        townArr: ["請選擇鄉政區", item.Town],
        dataArr: [item],
      });
      currentCity = item.City;
    } else {
      const lastIndexObj = arr[arr.length - 1];
      if(!lastIndexObj.townArr.includes(item.Town)) {
        lastIndexObj.townArr.push(item.Town);
      }
      lastIndexObj.dataArr.push(item);
    }
  })

  return arr;
}

function render(dinnerObj = { dataArr: dinnerInfoArr, 
  townArr: dinnerInfoByCityArr[cityIndexInt].townArr}) {
  if (!isInitialization) {
    elemSelectCity.innerHTML = makeStr(makeCityTempStr, dinnerInfoByCityArr);
  } 
  if (!isTownClicked) {
    elemSelectTown.innerHTML = makeStr(makeTownTempStr, 
    dinnerObj.townArr );
    isTownClicked = true;
  }
  elemSelectTown.value = dinnerObj.townName || "請選擇鄉政區";
  elemDisplay.innerHTML = makeStr(makeResturantTempStr, dinnerObj.dataArr);
}

function makeStr(tempCallBackFunc, dataArr, str='') {
  dataArr.forEach((item, index) => {
      str += tempCallBackFunc(item, index);
  })

  return str;
}

function makeResturantTempStr(item) {
  return `
    <section class="resturant">
      ${item.Url ? `<a class="resturant__link" href="${item.Url}" target=_blank>` : ''}
        <figure class="resturant__item">
          <img class="resturant__img" width="378" height="200" 
          src="${item.PicURL}" title="${item.Name}" alt="${item.Name}">
          <p class="resturant__city">${item.City}</p>
          <div class="resturant__textcntr">
            <div class="mask">
              <div class="resturant__text">
                <p class="resturant__location">${item.Town}</p>
                <h2 class="resturant__name">${item.Name}</h2>
                <p class="resturant__desc">${item.FoodFeature}</p>
              </div>
            </div>
          </div>
        </figure>
      ${item.Url ? "</a>" : ''}
    </section>
  `;
}

function makeCityTempStr(item, index) {
  return `
    <option ${index === 0 ? 
      'class="select__item select__item--title" selected="true" disabled="disabled"' : 
    'class="select__item"'}value="${item.city}">${item.city}</option>
  `;
}

function makeTownTempStr(item, index) {
  return `
    <option ${index === 0 ? 
      'class="select__item select__item--title" selected="true" disabled="disabled"' : 
    'class="select__item"'} 
    value="${item}">${item}</option>
  `;
}

function removeLoad() {
  elemLoad.style = "display: none;";
}

function setEvent() {
  elemSelectCntr.addEventListener('change', changeSelect);
}

function changeSelect(e, targetObj = {}) {
  const elemTarget = e.target;
  const targetValue = elemTarget.value;
  if (elemTarget === elemSelectCity) {
    targetObj = dinnerInfoByCityArr.find((item, index) => {
      if (item.city === targetValue) {
        cityIndexInt = index;
        return item;
      }
    });
    isTownClicked = false;
  } else {
    targetObj.dataArr = dinnerInfoByCityArr[cityIndexInt].dataArr
    .filter(item => item.Town === targetValue);
    targetObj.townName = targetValue;
  }
  render(targetObj);
}

setInit();