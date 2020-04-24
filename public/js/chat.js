const messageInput = document.querySelector('#message')
const MessageForm = document.querySelector('#messageForm')
const SendButton = document.querySelector('#SendButton')
const locButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')

//templates
const locTemplate = document.querySelector('#loc-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');

const socket = io()
//options

// const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
 
    $messages.scrollTop = $messages.scrollHeight
}


MessageForm.addEventListener('submit', (e) =>{
    e.preventDefault()
    
    SendButton.setAttribute('disabled','disabled')
    const myMessage = messageInput.value
    socket.emit('sendMessage', myMessage, (error)=> {
        SendButton.removeAttribute('disabled')
        messageInput.value = ''
        messageInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })

})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML =html
})

locButton.addEventListener('click',()=> {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    locButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position) => {

        latitude = position.coords.latitude
        longitude = position.coords.longitude

        socket.emit('sendLocation', {latitude, longitude},()=>{
            locButton.removeAttribute('disabled')

            // console.log(msg)
        })
        // console.log(position.coords.latitude, position.coords.longitude)
    })
})

socket.on('message', (message) => {
    console.log( message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('locationMessage', (message) => {
    // console.log( url)
    const html = Mustache.render(locTemplate, {
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.emit('join', {username, room}, (error)=> {
    if(error) {
        alert(error)
        location.href= '/'
    }

})