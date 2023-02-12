import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval
let access_token

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    access_token = localStorage.getItem('info')
    if(!access_token){
        access_token = prompt("请输入你的API密钥")
        localStorage.setItem('info', access_token)
    }
    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
            access_token
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const res_data = await response.json();
        const parsedData = res_data.res
        console.log(`Total Tokens:${parsedData.totalTokens}`)

        typeText(messageDiv, (parsedData.text+`(total: ${parsedData.totalTokens})`).trim())
    } else {
        const err = await response.json()
        if(err.statusCode === 401){
            access_token = prompt("你的API密钥不正确，请重新输入")
            localStorage.setItem('info', access_token)
        }
        else{
            messageDiv.innerHTML = "程序有错误发生。"
        }
        
        //alert(err)
    }
}

window.addEventListener('beforeunload', (e) => {
    console.log(e)
    if ((/Android/i.test(navigator.userAgent)) || /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
        //Mobile, do nothing
        
    }else{
        localStorage.removeItem('info');
    }
});

window.addEventListener('load', () => {
    access_token = localStorage.getItem('info')
    if(!access_token){
        access_token = prompt("请输入你的API密钥")
        localStorage.setItem('info', access_token)
    }
});




form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})