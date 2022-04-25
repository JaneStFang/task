const elemLoad = document.querySelector('#Load');
const elemMain = document.querySelector('#Main');
const elemSelectCntr = elemMain.querySelector('#SelectCntr');
const elemSelectCity = elemSelectCntr.querySelector('#SelectCity');
const elemSelectTown = elemSelectCntr.querySelector('#SelectTown');
const elemDisplay = elemMain.querySelector('#Display');
const foodsURL = 'https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx';
let isinitialization = false;
let isTownClicked = false;
let foodByCityArr;
let allFoodArr;
let cityIndex = 0;

async function setInit() {
  allFoodArr = await getDataByApi(foodsURL);
  handleData();
  render();
  removeLoad();
  setEvent();
  isinitialization = true;
}

async function getDataByApi(URL) {
  try {
    return fetch(URL).then(res => res.json());
  } catch (error) {
    alert('錯誤訊息： ', error);
  }
}

function handleData() {
  foodByCityArr = makeArrByCityArr(allFoodArr);
}

function makeArrByCityArr(sampleArr, city='', arr=[{
  city: '請選擇行政區域',
  townArr: ["請選擇鄉政區"],
}]) {
  sampleArr.forEach(item => {
    if (city !== item.City) {
      const innerObj = {
        city: item.City,
        townArr: ["請選擇鄉政區", item.Town],
        dataArr: [item],
      }
      arr.push(innerObj);
      city = item.City;
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

function render(foodObj = { dataArr: allFoodArr, }) {
  if (!isinitialization) {
    elemSelectCity.innerHTML = makeStr(makeCityTempStr, foodByCityArr);
  } 
  if (!isTownClicked) {
    elemSelectTown.innerHTML = makeStr(makeTownTempStr, 
    foodObj.townArr || foodByCityArr[cityIndex].townArr);
    isTownClicked = true;
  }
  elemSelectTown.value = foodObj.townName || "請選擇鄉政區";
  elemDisplay.innerHTML = makeStr(makeResturantTempStr, foodObj.dataArr);
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
    <option ${index === 0 ? 'class="select__item select__item--title" disable':
    'class="select__item"'} value="${item.city}">${item.city}</option>
  `;
}

function makeTownTempStr(item, index) {
  return `
    <option class="select__item ${index === 0 ? 'select__item--title' : ''}" 
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
  if (elemTarget.nodeName !== 'SELECT') return;
  if (elemTarget === elemSelectCity) {
    targetObj = foodByCityArr.find((item, index) => {
      cityIndex = index;
      return item.city === targetValue;
    });
    isTownClicked = false;
  } else {
    targetObj.dataArr = foodByCityArr[cityIndex].dataArr.filter(item => {
      return item.Town === targetValue;
    });
    targetObj.townName = targetValue;
  }
  render(targetObj);
}

setInit();