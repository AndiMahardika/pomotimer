const SAVED_EVENT = 'saved-task';
const STORAGE_KEY = 'POMOTIMER_APPS';

const tasks = []
let speed = 1;
let globalTime;

const playBtn = document.querySelector('.play-button')
const timer = document.querySelector('.time')
const addButton = document.querySelector('.add-button')
const boxInput = document.querySelector('.input-box')
const closeBtn = document.querySelector('.close-button')
const inputTask = document.querySelector('#input-task')
const restarBtn = document.querySelector('.restart-button')
const speedBtn = document.querySelector('.speed-up-button')
const breakWord = document.querySelector('#break-word')
const shortBtn = document.querySelector('#short-button')
const longBtn = document.querySelector('#long-button')
 
// sound
let sound = new Audio("sound/Vestia Zeta.mp3");

document.addEventListener('DOMContentLoaded', function(){
  inputTask.addEventListener('submit', function(e){
    e.preventDefault()
    addTask()
    addButton.removeAttribute('disabled', true)
  })

  if(isStorageExist()){
    loadDataFromStorage()
  }

  innerTime()
})

addButton.addEventListener('click', function(){
  boxInput.classList.toggle('hidden')
  addButton.setAttribute('disabled', true)
})

closeBtn.addEventListener('click', function(){
  boxInput.classList.toggle('hidden')
  addButton.removeAttribute('disabled', true)
})

function addTask(){
  const title = capitalFirsWord(document.querySelector('#input-title').value)
  const curTime = "01:00";
  const status = false;
  const id = generateId();

  if(title != ''){
    const taskObject = generateTaskObject(id, title, curTime, status)
    tasks.push(taskObject)
  }

  inputTask.reset()
  render(tasks)
  saveData()
}

function generateId(){
  return +new Date()
}

function generateTaskObject(id, title, curTime, status){
  return {
    id,
    title,
    curTime,
    status
  }
} 

function taskSelect(taskTarget){
  tasks.forEach(task => task.status = false); // setel semua status ke false
  taskTarget.status = true; // setel status target ke true
}

function itemTask(item){
  return `<div class="mb-3 bg-[#CED7E0] text-slate-800">
  <div class="${item.status ? 'border-4 border-slate-700' : 'border-2'} flex items-center justify-between items " data-curtime="${item.curTime}" data-taskid="${item.id}">
    <div class="h-10 w-3 bg-[#5591A9]"></div>
    <h4 class="text-center text-md font-semibold">${item.title}</h4>
    <div class="">
      <span class="text-xl me-2 cursor-pointer ${item.status ? 'text-green-600': 'text-red-600'}"><i class="fa-solid fa-square-check"></i></span>
      <span class="text-xl me-2 cursor-pointer" data-taskid="${item.id}"><i class="btn-edit fa-solid fa-pen-to-square" data-taskid="${item.id}"></i></span>
      <span class="text-xl me-2 cursor-pointer" data-taskid="${item.id}"><i class="fa-solid fa-trash btn-delete" data-taskid="${item.id}"></i></span>
    </div>  
  </div>
</div>`
}

function render(tasks){
  const taskBox = document.querySelector('.task-box')
  let items = ``

  tasks.map(el => items += itemTask(el))

  taskBox.innerHTML = items
}

function findIndexTask(taskid){
  for (const index in tasks) {
    if(tasks[index].id == taskid){
      return index
    }
  }
  return -1
}

function findTask(taskid){
  for (const taskTarget of tasks) {
    if(taskTarget.id == taskid){
      return taskTarget;
    }
  }
  return null;
}

function innerTime(){
  const activeTask = tasks.find(task => task.status);
  if (activeTask) {
    timer.innerText = activeTask.curTime;
    // prevTime = activeTask.curTime;
    globalTime = activeTask;
  } 
}

function removeTask(taskid){
  const taskTarget = findIndexTask(taskid)

  if(taskTarget === -1) return;

  tasks.splice(taskTarget, 1)
  render(tasks)
  saveData()
}

document.addEventListener('click', function(event){
  const target = event.target;

  if(target.classList.contains('btn-delete')){
    const taskId = target.dataset.taskid;
    removeTask(taskId)
  }

  if(target.classList.contains('items')){
    target.classList.toggle('border-4');
    target.classList.toggle('border-slate-700');
    const taskTarget = findTask(target.dataset.taskid);
    taskTarget.status = !taskTarget.status;
    taskSelect(taskTarget)
    saveData()
    render(tasks)
    innerTime()
    
    isPaused = true;
    isBreak = false;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    speedBtn.setAttribute('disabled', true);
    breakWord.classList.add('hidden');
    timer.classList.add('mt-10')
    clearInterval(timerInterval)  

    // stop sound 
    sound.currentTime = 0;
    sound.pause()
  }

  if(target.classList.contains('btn-edit')){
    const taskId = target.dataset.taskid;
    editTask(taskId)
  }
})

// waktu
let isPaused = true;
let isBreak = false
let timerBreak = shortBtn.dataset.time
let timerInterval;
let prevTime ;

if(isPaused){
  speedBtn.setAttribute('disabled', true)
}

playBtn.addEventListener('click', function(){
  if(isPaused){
    isPaused = false;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
    speedBtn.removeAttribute('disabled', true)
    countdown()
    if(isBreak){
      sound.play()
    } else {
      sound.currentTime = 0;
      sound.pause()
    }
  } else {
    isPaused = true;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
    speedBtn.setAttribute('disabled', true)
    clearInterval(timerInterval)
    sound.pause()
  }
  saveData()
})

restarBtn.addEventListener('click', function(){
  const restartTime = '01:00'
  timer.innerText = restartTime;
  if(globalTime){
    globalTime.curTime = restartTime;
  }
  isPaused = true;
  clearInterval(timerInterval)
  playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`
  isBreak = false;
  breakWord.classList.add('hidden')
  timer.classList.add('mt-10')
  sound.currentTime = 0;
  sound.pause()
})

function countdown(){
  let curTime = timer.innerText;
  let [minutes, seconds] = curTime.split(':')
  minutes = parseInt(minutes)
  seconds = parseInt(seconds)

  if(minutes == 0 && seconds == 0){
    if(!isBreak){
      breakWord.classList.toggle('hidden')
      timer.classList.toggle('mt-10')

      isBreak = true;
      [minutes, seconds] = timerBreak.split(':')
      minutes = parseInt(minutes)
      seconds = parseInt(seconds)

      // sound.play()
      if(timerBreak == '05:00'){
        sound.play()
      } else {
        sound.play()  
        sound.addEventListener('ended', repeatSound);
      }

      // minutes = 1
      // seconds = 0
    } else {
      breakWord.classList.toggle('hidden')
      timer.classList.toggle('mt-10')
      isBreak = false;
      minutes = 1
      seconds = 0
      sound.currentTime = 0;
      sound.pause()
    }
  }

  if(seconds == 0){
    minutes -= 1
    seconds = 59
  } else {
    seconds -= 1
  }

  if(seconds < 10){
    seconds = '0' + seconds
  }

  if(minutes < 10){
    minutes = '0' + minutes
  }

  timer.innerText = `${minutes}:${seconds}`
  if(isBreak){
    prevTime = '01:00';
  } else {
    prevTime = `${minutes}:${seconds}`;
  }
  // globalTime.curTime = prevTime;
  if (globalTime) {
    globalTime.curTime = prevTime;
  } 
  
  timerInterval = setTimeout(countdown, 1000 / speed)
}

speedBtn.addEventListener('click', function(){
  if(speed < 4){
    speed += 1;
    if(speed > 3){
      speed = 1;
    }
  }
  speedBtn.innerHTML = speed == 1 ? `<i class="fa-solid fa-angles-right"></i>` : `${speed}<i class="fa-solid fa-angles-right"></i>`
})

function changeSound(time){
  if(time == '05:00'){
    sound = new Audio("sound/Vestia Zeta.mp3");
  } else {
    sound = new Audio("sound/Aku Gak Halu.mp3");
  }
  return sound;
}

// fungsi mengulang sound
function repeatSound() {
  sound.currentTime = 0; 
  sound.play(); 
}

// fungsi edit
function editTask(taskId) {
  const taskTarget = findTask(taskId);
  const editForm = document.querySelector('#edit-task');
  editForm.classList.toggle('hidden');

  editForm.addEventListener('submit', function(e){
    e.preventDefault();
    taskTarget.title = document.querySelector('#title-edit').value

    saveData()
    render(tasks)
  }) 
}


//tombol break
shortBtn.addEventListener('click', function(){
  if(shortBtn.classList.contains('bg-[#9CCDDC]')){ 
    shortBtn.classList.remove('bg-[#9CCDDC]')
    shortBtn.classList.add('border-slate-700','bg-[#CED7E0]')
    shortBtn.innerHTML = 'short break <i class="fa-solid fa-check"></i>'
    shortBtn.setAttribute('disabled', true)
    longBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    longBtn.classList.add('bg-[#9CCDDC]')
    longBtn.innerHTML = 'long break'
    longBtn.removeAttribute('disabled')
    // sound = new Audio("sound/JKT48 - Pesawat Kertas 365 Hari.mp3")
    timerBreak = shortBtn.dataset.time;
    changeSound(timerBreak)
  } else {
    shortBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    shortBtn.classList.add('bg-[#9CCDDC]')
    longBtn.innerHTML = 'short break'
  }
})

longBtn.addEventListener('click', function(){
  if(longBtn.classList.contains('bg-[#9CCDDC]')){ 
    longBtn.classList.remove('bg-[#9CCDDC]')
    longBtn.classList.add('border-slate-700','bg-[#CED7E0]')
    longBtn.innerHTML = 'long break <i class="fa-solid fa-check"></i>'
    longBtn.setAttribute('disabled', true)
    shortBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    shortBtn.classList.add('bg-[#9CCDDC]')
    shortBtn.innerHTML = 'short break'
    shortBtn.removeAttribute('disabled')
    // sound = new Audio("sound/JKT48 - SEVENTEEN.mp3")
    timerBreak = longBtn.dataset.time
    changeSound(timerBreak)
  } else {
    longBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    longBtn.classList.add('bg-[#9CCDDC]')
  }
})


// Storage
function isStorageExist(){
  if(typeof(Storage) == undefined){
    alert('Browser kamu tidak mendukung local storage')
    return false
  } 
  return true
}

function saveData(){
  if(isStorageExist()){
    const parsed = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY,parsed)
    // document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// document.addEventListener(SAVED_EVENT, function(){

// })

function loadDataFromStorage(){
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData)

  if(data != null){
    for (const task of data) {
      tasks.push(task)
    }
  }
  render(tasks)
}

// function capitalFirsWord
function capitalFirsWord(word){
  word = word.trim()
  const arr = word.split("")
  const result = []
  for (let i = 0; i < arr.length; i++) {
    if(i == 0){
      arr[i] = arr[i].toUpperCase()
      // result.push(arr[i])
    } else if(arr[i] == ' '){
      arr[i+1] = arr[i+1].toUpperCase()
      // result.push(arr[i+1])
    } else if (arr[i] == arr[i].toUpperCase() && arr[i-1] != ' '){
      arr[i] = arr[i].toLowerCase()
    }
    result.push(arr[i])
  }
  return result.join("")
}