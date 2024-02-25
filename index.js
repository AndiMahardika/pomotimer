const tasks = [
  {
    title : 'Pemograman web',
    id: 123,
    status: false
  },
]

let speed = 1;

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

document.addEventListener('DOMContentLoaded', function(){
  inputTask.addEventListener('submit', function(e){
    e.preventDefault()
    addTask()
    boxInput.classList.toggle('hidden')
    addButton.removeAttribute('disabled', true)
  })
  render(tasks)
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
  const title = document.querySelector('#input-title').value
  const status = false;
  const id = generateId()

  if(title != ''){
    const taskObject = generateTaskObject(id, title, status)
    tasks.push(taskObject)
  }

  inputTask.reset()
  render(tasks)
}

function generateId(){
  return +new Date()
}

function generateTaskObject(id, title, status){
  return {
    id,
    title,
    status
  }
} 

function itemTask(item){
  return `<div class="items mb-3 bg-[#CED7E0] text-slate-800">
  <div class="border-2 flex items-center justify-between">
    <div class="h-10 w-3 bg-red-600"></div>
    <h4 class="text-center text-md font-semibold">${item.title}</h4>
    <div class="">
      <span class="text-xl me-2 cursor-pointer text-red-600"><i class="fa-solid fa-square-check"></i></span>
      <span class="text-xl me-2 cursor-pointer"><i class="fa-solid fa-pen-to-square"></i></span>
      <span class="text-xl me-2 cursor-pointer"><i class="fa-solid fa-trash btn-delete" data-taskid="${item.id}"></i></span>
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

function removeTask(taskid){
  const taskTarget = findIndexTask(taskid)

  if(taskTarget === -1) return;

  tasks.splice(taskTarget, 1)
  render(tasks)
}

document.addEventListener('click', function(event){
  const target = event.target;

  if(target.classList.contains('btn-delete')){
    const taskId = target.dataset.taskid;
    console.log(taskId)
    removeTask(taskId)
  }
})

// waktu
let isPaused = true
let isBreak = false
let timerBreak = shortBtn.dataset.time
let timerInterval;
if(isPaused){
  speedBtn.setAttribute('disabled', true)
}

playBtn.addEventListener('click', function(){
  if(isPaused){
    isPaused = false;
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
    speedBtn.removeAttribute('disabled', true)
    countdown()
  } else {
    isPaused = true;
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
    speedBtn.setAttribute('disabled', true)
    clearInterval(timerInterval)
  }
})

restarBtn.addEventListener('click', function(){
  timer.innerText = '01:00'
  isPaused = true;
  clearInterval(timerInterval)
  playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`
  isBreak = false;
  breakWord.classList.add('hidden')
  timer.classList.add('mt-10')
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

      // minutes = 1
      // seconds = 0
    } else {
      breakWord.classList.toggle('hidden')
      timer.classList.toggle('mt-10')
      isBreak = false;
      minutes = 1
      seconds = 0
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

//tombol break
shortBtn.addEventListener('click', function(){
  if(shortBtn.classList.contains('bg-[#9CCDDC]')){ 
    shortBtn.classList.remove('bg-[#9CCDDC]')
    shortBtn.classList.add('border-slate-700','bg-[#CED7E0]')
    shortBtn.innerHTML = 'short break <i class="fa-solid fa-check"></i>'
    longBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    longBtn.classList.add('bg-[#9CCDDC]')
    longBtn.innerHTML = 'long break'
    timerBreak = shortBtn.dataset.time
  } else {
    shortBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    shortBtn.classList.add('bg-[#9CCDDC]')
    longBtn.innerHTML = 'short break'
  }
  // console.log(timerBreak)
})

longBtn.addEventListener('click', function(){
  if(longBtn.classList.contains('bg-[#9CCDDC]')){ 
    longBtn.classList.remove('bg-[#9CCDDC]')
    longBtn.classList.add('border-slate-700','bg-[#CED7E0]')
    longBtn.innerHTML = 'long break <i class="fa-solid fa-check"></i>'
    shortBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    shortBtn.classList.add('bg-[#9CCDDC]')
    shortBtn.innerHTML = 'short break'
    timerBreak = longBtn.dataset.time
  } else {
    longBtn.classList.remove('border-slate-700','bg-[#CED7E0]')
    longBtn.classList.add('bg-[#9CCDDC]')
  }
  // console.log(timerBreak)
})